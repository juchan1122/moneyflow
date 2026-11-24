package com.moneyflow.global.error;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** API 명세 v1.0 1장 에러 코드. 프론트는 code 값으로 분기한다 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

	VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "입력값을 확인해 주세요."),
	UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요해요."),
	FORBIDDEN(HttpStatus.FORBIDDEN, "접근할 수 없어요."),
	NOT_FOUND(HttpStatus.NOT_FOUND, "찾을 수 없어요."),
	METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 요청 방식이에요."),
	EMAIL_TAKEN(HttpStatus.CONFLICT, "이미 가입된 이메일이에요."),
	DUPLICATE_NAME(HttpStatus.CONFLICT, "같은 이름이 이미 있어요."),
	PAST_MONTH_LOCKED(HttpStatus.UNPROCESSABLE_CONTENT, "지난달 기록은 바꿀 수 없어요."),
	DAY_HAS_TRANSACTIONS(HttpStatus.UNPROCESSABLE_CONTENT, "기록이 있는 날은 무지출로 바꿀 수 없어요."),
	NOT_PENDING(HttpStatus.UNPROCESSABLE_CONTENT, "이미 처리된 항목이에요."),
	INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "잠시 후 다시 시도해 주세요.");

	private final HttpStatus status;
	private final String message;
}
