package com.moneyflow.global;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.moneyflow.global.error.BusinessException;
import com.moneyflow.global.error.ErrorCode;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/** TASK-21 기본 설정 확인: 보안 · CSRF · 에러 응답 모양 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(GlobalSetupTest.TestController.class)
class GlobalSetupTest {

	@Autowired
	MockMvc mvc;

	@Test
	void 헬스체크는_로그인_없이_열린다() throws Exception {
		mvc.perform(get("/actuator/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("UP"));
	}

	@Test
	void 로그인_안_한_API_요청은_JSON_401() throws Exception {
		mvc.perform(get("/api/v1/home"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
				.andExpect(jsonPath("$.fieldErrors").isEmpty());
	}

	@Test
	void CSRF_토큰_없는_POST는_403() throws Exception {
		mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("FORBIDDEN"));
	}

	@Test
	@WithMockUser
	void 입력값이_틀리면_어떤_칸인지_알려준다() throws Exception {
		mvc.perform(post("/api/v1/test/validate").with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"name\":\"\",\"amount\":-1}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
				.andExpect(jsonPath("$.fieldErrors.length()").value(2));
	}

	@Test
	@WithMockUser
	void 깨진_JSON은_400() throws Exception {
		mvc.perform(post("/api/v1/test/validate").with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("{broken"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
	}

	@Test
	@WithMockUser
	void 비즈니스_예외는_정해진_코드로() throws Exception {
		mvc.perform(get("/api/v1/test/locked"))
				.andExpect(status().isUnprocessableContent())
				.andExpect(jsonPath("$.code").value("PAST_MONTH_LOCKED"));
	}

	@Test
	@WithMockUser
	void 없는_주소는_404() throws Exception {
		mvc.perform(get("/api/v1/no-such-thing"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("NOT_FOUND"));
	}

	@Test
	@WithMockUser
	void 예상_못한_예외는_500_내부_내용은_숨긴다() throws Exception {
		mvc.perform(get("/api/v1/test/boom"))
				.andExpect(status().isInternalServerError())
				.andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
				.andExpect(jsonPath("$.message").value(ErrorCode.INTERNAL_ERROR.getMessage()));
	}

	record SampleRequest(@NotBlank String name, @Positive long amount) {
	}

	@RestController
	static class TestController {

		@PostMapping("/api/v1/test/validate")
		void validate(@Valid @RequestBody SampleRequest request) {
		}

		@GetMapping("/api/v1/test/locked")
		void locked() {
			throw new BusinessException(ErrorCode.PAST_MONTH_LOCKED);
		}

		@GetMapping("/api/v1/test/boom")
		void boom() {
			throw new IllegalStateException("db password is secret");
		}
	}
}
