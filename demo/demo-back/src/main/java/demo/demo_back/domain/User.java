package demo.demo_back.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor; // @AllArgsConstructor 임포트 추가
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
// UserDetails 구현을 위한 임포트들
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.ArrayList; // ArrayList 임포트 (getAuthorities 구현에 사용)

@Entity
@Table(name = "users")
@Data // @Data는 @Getter, @Setter, @ToString, @EqualsAndHashCode 등을 포함
@NoArgsConstructor
@AllArgsConstructor // @AllArgsConstructor 어노테이션 추가
public class User implements UserDetails { // UserDetails 인터페이스 구현

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false, unique = true, length = 50)
    private String userName;

    @Column(nullable = false, length = 100)
    private String password;

    // 사용자 역할을 저장하는 필드 (예: "ROLE_USER", "ROLE_ADMIN")
    @Column(nullable = false, length = 20) // 역할 문자열 길이 적절히 설정
    private String role; // 역할 필드

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at") // ERD에 맞춰 nullable = true (기본값)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude // 순환 참조 방지
    @EqualsAndHashCode.Exclude // 순환 참조 방지
    private List<Board> boards;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude // 순환 참조 방지
    @EqualsAndHashCode.Exclude // 순환 참조 방지
    private List<Comment> comments;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // updatedAt은 ERD에서 nullable이므로 생성 시점에 여기서 설정하지 않음
        // updatedAt = LocalDateTime.now(); // 이 라인 삭제
        // role 필드 초기값 설정 (DB 기본값과 별개로 애플리케이션에서 설정)
        if (this.role == null) { // null 체크 후 기본값 설정
             this.role = "ROLE_USER";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // 수정 시각 업데이트
    }

    // --- UserDetails 인터페이스 구현 메소드 ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 사용자의 역할(role)을 GrantedAuthority 컬렉션으로 반환
        // "ROLE_" 접두사를 붙이는 것이 Spring Security의 관례입니다.
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(this.role)); // role 필드를 GrantedAuthority로 변환
        return authorities;
    }

    @Override
    public String getUsername() {
        // 인증 시 사용될 사용자 이름 (userName 필드 사용)
        return this.userName;
    }

    @Override
    public boolean isAccountNonExpired() {
        // 계정 만료 여부 (만료되지 않았다면 true 반환)
        return true; // 실제 서비스에서는 만료 로직 구현 필요
    }

    @Override
    public boolean isAccountNonLocked() {
        // 계정 잠금 여부 (잠겨있지 않다면 true 반환)
        return true; // 실제 서비스에서는 잠금 로직 구현 필요
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // 자격 증명(비밀번호) 만료 여부 (만료되지 않았다면 true 반환)
        return true; // 실제 서비스에서는 비밀번호 만료 로직 구현 필요
    }

    @Override
    public boolean isEnabled() {
        // 계정 활성화 여부 (활성화되어 있다면 true 반환)
        return true; // 실제 서비스에서는 활성화/비활성화 로직 구현 필요
    }

    // getPassword() 메소드는 @Data 어노테이션이 자동으로 생성해 줍니다.
}