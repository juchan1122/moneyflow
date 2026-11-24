package com.moneyflow.global.error;

import lombok.Getter;

/** 서비스에서 규칙 위반을 알릴 때 던진다. 예: throw new BusinessException(ErrorCode.EMAIL_TAKEN) */
@Getter
public class BusinessException extends RuntimeException {

	private final ErrorCode errorCode;

	public BusinessException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.errorCode = errorCode;
	}

	public BusinessException(ErrorCode errorCode, String message) {
		super(message);
		this.errorCode = errorCode;
	}
}
