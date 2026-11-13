use std::collections::BTreeMap;

use anyhow::{Context, bail};

#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Int(i64),
    Bytes(Vec<u8>),
    List(Vec<Value>),
    Dict(BTreeMap<Vec<u8>, Value>),
}

impl Value {
    pub fn get(&self, key: &str) -> Option<&Value> {
        match self {
            Value::Dict(d) => d.get(key.as_bytes()),
            _ => None,
        }
    }

    pub fn as_str(&self) -> Option<&str> {
        match self {
            Value::Bytes(b) => std::str::from_utf8(b).ok(),
            _ => None,
        }
    }

    pub fn as_int(&self) -> Option<i64> {
        match self {
            Value::Int(i) => Some(*i),
            _ => None,
        }
    }

    pub fn as_dict(&self) -> Option<&BTreeMap<Vec<u8>, Value>> {
        match self {
            Value::Dict(d) => Some(d),
            _ => None,
        }
    }
}

pub fn decode(input: &[u8]) -> anyhow::Result<Value> {
    let mut pos = 0;
    let v = parse(input, &mut pos, 0)?;
    Ok(v)
}

fn parse(b: &[u8], pos: &mut usize, depth: usize) -> anyhow::Result<Value> {
    if depth > 64 {
        bail!("bencode nesting too deep");
    }
    let c = *b.get(*pos).context("unexpected end of bencode")?;
    match c {
        b'i' => {
            *pos += 1;
            let end = find(b, *pos, b'e')?;
            let n = std::str::from_utf8(&b[*pos..end])?.parse()?;
            *pos = end + 1;
            Ok(Value::Int(n))
        }
        b'l' => {
            *pos += 1;
            let mut out = Vec::new();
            while *b.get(*pos).context("unterminated list")? != b'e' {
                out.push(parse(b, pos, depth + 1)?);
            }
            *pos += 1;
            Ok(Value::List(out))
        }
        b'd' => {
            *pos += 1;
            let mut out = BTreeMap::new();
            while *b.get(*pos).context("unterminated dict")? != b'e' {
                let Value::Bytes(k) = parse(b, pos, depth + 1)? else {
                    bail!("dict key must be a string");
                };
                let v = parse(b, pos, depth + 1)?;
                out.insert(k, v);
            }
            *pos += 1;
            Ok(Value::Dict(out))
        }
        b'0'..=b'9' => {
            let colon = find(b, *pos, b':')?;
            let len: usize = std::str::from_utf8(&b[*pos..colon])?.parse()?;
            let start = colon + 1;
            let end = start.checked_add(len).context("length overflow")?;
            if end > b.len() {
                bail!("string runs past end of input");
            }
            *pos = end;
            Ok(Value::Bytes(b[start..end].to_vec()))
        }
        _ => bail!("invalid bencode at byte {}", *pos),
    }
}

fn find(b: &[u8], from: usize, ch: u8) -> anyhow::Result<usize> {
    b[from..]
        .iter()
        .position(|&x| x == ch)
        .map(|p| p + from)
        .context("malformed bencode")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_nested() {
        let v = decode(b"d4:pathl1:a1:be9:save_path8:/srv/dl/6:pausedi1ee").unwrap();
        assert_eq!(v.get("save_path").and_then(Value::as_str), Some("/srv/dl/"));
        assert_eq!(v.get("paused").and_then(Value::as_int), Some(1));
        assert!(matches!(v.get("path"), Some(Value::List(l)) if l.len() == 2));
    }

    #[test]
    fn rejects_garbage() {
        assert!(decode(b"x").is_err());
        assert!(decode(b"5:abc").is_err());
        assert!(decode(b"d3:key").is_err());
    }
}
