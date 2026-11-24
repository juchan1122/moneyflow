package com.moneyflow;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MoneyflowServerApplicationTests {

	@Autowired
	Clock clock;

	@Test
	void contextLoads() {
	}

	@Test
	void 시계는_한국_시간대다() {
		assertThat(clock.getZone()).isEqualTo(ZoneId.of("Asia/Seoul"));
	}

}
