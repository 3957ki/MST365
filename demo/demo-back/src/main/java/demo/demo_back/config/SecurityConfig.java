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
import org.springframework.http.HttpMethod;

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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/boards/**").authenticated() // ✅ 추가
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}