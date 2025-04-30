package demo.demo_back.config;

import demo.demo_back.service.AuthService; // AuthService 임포트 (JwtAuthenticationFilter Bean 생성에 필요)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // JwtAuthenticationFilter를 직접 주입받는 생성자 제거
    // private final JwtAuthenticationFilter jwtAuthenticationFilter;
    // @Autowired public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) { this.jwtAuthenticationFilter = jwtAuthenticationFilter; }

    // AuthService를 주입받아 JwtAuthenticationFilter Bean 생성에 사용
    private final AuthService authService; // AuthService 주입 필드 추가

    @Autowired // 생성자 주입
    public SecurityConfig(AuthService authService) { // AuthService 주입받도록 생성자 변경
        this.authService = authService;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // JwtAuthenticationFilter Bean 정의
    // @Bean 메소드로 필터를 정의하고 AuthService Bean을 주입받아 사용
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() { // Bean 메소드 이름 변경 가능 (예: authenticationFilter)
         return new JwtAuthenticationFilter(authService); // 주입받은 AuthService 사용
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // 프론트엔드 출처
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")); // 허용할 HTTP 메소드
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type")); // 허용할 헤더
        configuration.setAllowCredentials(true); // 인증 정보 포함 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정 적용
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 사용 안 함
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll() // 인증 관련 경로는 모두 허용
                .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
            );

        // 필터 체인에 JwtAuthenticationFilter Bean 추가
        // @Bean 메소드로 정의된 필터를 addFilterBefore로 추가
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class); // 위에 정의된 jwtAuthenticationFilter Bean 사용

        return http.build(); // SecurityFilterChain 빌드 및 반환
    }
}