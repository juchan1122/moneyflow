package com.moneyflow.global;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

/**
 * 진짜 MySQL 8에서 Flyway와 JPA가 뜨는지 확인한다 (운영과 같은 DB).
 * Docker가 없는 PC에서는 건너뛴다.
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class MySqlFlywayTest {

	@Container
	@ServiceConnection
	static MySQLContainer mysql = new MySQLContainer("mysql:8.4");

	@Autowired
	DataSource dataSource;

	@Test
	void MySQL_8에_연결되고_Flyway가_돈다() {
		JdbcTemplate jdbc = new JdbcTemplate(dataSource);
		assertThat(jdbc.queryForObject("select version()", String.class)).startsWith("8.");
		assertThat(jdbc.queryForObject("select count(*) from flyway_schema_history", Integer.class)).isNotNull();
	}
}
