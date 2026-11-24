package com.moneyflow.global.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * "오늘"을 정하는 시계. 코드에서는 LocalDate.now() 대신 LocalDate.now(clock)을 쓴다.
 * 테스트에서는 이 빈을 고정 시계로 바꿔서 날짜가 바뀌는 상황(자정 마감 등)을 재현한다.
 */
@Configuration
public class ClockConfig {

	public static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

	@Bean
	public Clock clock() {
		return Clock.system(SEOUL);
	}
}
