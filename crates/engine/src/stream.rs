use std::io::SeekFrom;

use axum::body::Body;
use axum::response::{IntoResponse, Response};
use http::{HeaderMap, HeaderValue, StatusCode, header};
use librqbit::api::TorrentIdOrHash;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tokio_util::io::ReaderStream;

use crate::Engine;

pub fn parse_range(value: &str, len: u64) -> Option<(u64, u64)> {
    let spec = value.strip_prefix("bytes=")?.split(',').next()?.trim();
    let (start, end) = spec.split_once('-')?;
    if start.is_empty() {
        let suffix: u64 = end.parse().ok()?;
        if suffix == 0 || len == 0 {
            return None;
        }
        return Some((len.saturating_sub(suffix), len - 1));
    }
    let start: u64 = start.parse().ok()?;
    let end = if end.is_empty() {
        len.checked_sub(1)?
    } else {
        end.parse::<u64>().ok()?.min(len.checked_sub(1)?)
    };
    if start > end || start >= len {
        return None;
    }
    Some((start, end))
}

fn error(status: StatusCode, msg: &str) -> Response {
    (status, msg.to_string()).into_response()
}

pub async fn serve(engine: &Engine, id: TorrentIdOrHash, file: usize, headers: &HeaderMap) -> Response {
    let mut stream = match engine.api.api_stream(id, file).await {
        Ok(s) => s,
        Err(e) => return error(e.status(), &e.to_string()),
    };
    let len = stream.len();
    let mime = engine
        .api
        .torrent_file_mime_type(id, file)
        .unwrap_or("application/octet-stream");

    let mut out = HeaderMap::new();
    out.insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    out.insert(header::CONTENT_TYPE, HeaderValue::from_static(mime));
    out.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));

    let range = headers.get(header::RANGE).and_then(|v| v.to_str().ok());
    let (status, start, end) = match range {
        Some(r) => match parse_range(r, len) {
            Some((s, e)) => (StatusCode::PARTIAL_CONTENT, s, e),
            None => {
                out.insert(
                    header::CONTENT_RANGE,
                    HeaderValue::from_str(&format!("bytes */{len}")).unwrap(),
                );
                return (StatusCode::RANGE_NOT_SATISFIABLE, out).into_response();
            }
        },
        None => (StatusCode::OK, 0, len.saturating_sub(1)),
    };

    if start > 0
        && let Err(e) = stream.seek(SeekFrom::Start(start)).await {
            return error(StatusCode::INTERNAL_SERVER_ERROR, &e.to_string());
        }
    let take = if len == 0 { 0 } else { end - start + 1 };
    out.insert(header::CONTENT_LENGTH, HeaderValue::from(take));
    if status == StatusCode::PARTIAL_CONTENT {
        out.insert(
            header::CONTENT_RANGE,
            HeaderValue::from_str(&format!("bytes {start}-{end}/{len}")).unwrap(),
        );
    }
    let body = Body::from_stream(ReaderStream::with_capacity(stream.take(take), 64 * 1024));
    (status, out, body).into_response()
}

#[cfg(test)]
mod tests {
    use super::parse_range;

    #[test]
    fn ranges() {
        assert_eq!(parse_range("bytes=0-", 100), Some((0, 99)));
        assert_eq!(parse_range("bytes=10-19", 100), Some((10, 19)));
        assert_eq!(parse_range("bytes=90-200", 100), Some((90, 99)));
        assert_eq!(parse_range("bytes=-10", 100), Some((90, 99)));
        assert_eq!(parse_range("bytes=100-", 100), None);
        assert_eq!(parse_range("bytes=20-10", 100), None);
        assert_eq!(parse_range("items=0-1", 100), None);
        assert_eq!(parse_range("bytes=0-", 0), None);
    }
}
