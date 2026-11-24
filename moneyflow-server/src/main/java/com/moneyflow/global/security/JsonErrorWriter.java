package com.moneyflow.global.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.http.MediaType;

import com.moneyflow.global.error.ErrorCode;

import jakarta.servlet.http.HttpServletResponse;

/**
 * 보안 필터 단계(컨트롤러 전)에서 나는 401 · 403을 JSON으로 쓴다.
 * 메시지는 ErrorCode에 고정된 문장이라 따옴표 등 특수문자가 없다.
 */
final class JsonErrorWriter {

	private JsonErrorWriter() {
	}

	static void write(HttpServletResponse response, ErrorCode code) throws IOException {
		response.setStatus(code.getStatus().value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding(StandardCharsets.UTF_8.name());
		response.getWriter().write(
				"{\"code\":\"" + code.name() + "\",\"message\":\"" + code.getMessage() + "\",\"fieldErrors\":[]}");
	}
}
