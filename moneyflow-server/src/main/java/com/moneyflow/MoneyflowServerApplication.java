package com.moneyflow;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MoneyflowServerApplication {

	public static void main(String[] args) {
		// 서버가 어느 나라에 있든 "오늘"은 한국 날짜 기준 (시스템 구조 4장)
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
		SpringApplication.run(MoneyflowServerApplication.class, args);
	}

}
