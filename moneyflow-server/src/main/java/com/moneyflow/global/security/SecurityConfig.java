package com.moneyflow.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.moneyflow.global.error.ErrorCode;

/**
 * 세션 로그인 기반 보안 설정 (시스템 구조 v1.0 5장).
 * - CSRF: XSRF-TOKEN 쿠키 → 프론트가 X-XSRF-TOKEN 헤더로 돌려보낸다
 * - 로그인 안 한 요청은 로그인 페이지로 보내지 않고 JSON 401
 * - 로그인 · 회원가입 API와 remember-me는 TASK-23(인증)에서 붙인다
 */
@Configuration
public class SecurityConfig {

	@Bean
	@Order(2)
	public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.spa())
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.logout(AbstractHttpConfigurer::disable)
				.requestCache(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/v1/auth/signup", "/api/v1/auth/login").permitAll()
						.requestMatchers("/actuator/health").permitAll()
						.anyRequest().authenticated())
				.exceptionHandling(ex -> ex
						.authenticationEntryPoint((req, res, e) -> JsonErrorWriter.write(res, ErrorCode.UNAUTHORIZED))
						.accessDeniedHandler((req, res, e) -> JsonErrorWriter.write(res, ErrorCode.FORBIDDEN)));
		return http.build();
	}

	/** local 프로필에서만 H2 콘솔을 연다. 운영에는 이 설정 자체가 없다 */
	@Bean
	@Order(1)
	@Profile("local")
	public SecurityFilterChain h2ConsoleFilterChain(HttpSecurity http) throws Exception {
		http
				.securityMatcher("/h2-console/**")
				.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
				.csrf(AbstractHttpConfigurer::disable)
				.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
