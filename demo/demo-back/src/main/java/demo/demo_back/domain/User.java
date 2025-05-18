package demo.demo_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 사용자(User) 엔티티 클래스.
 * Spring Security 인증을 위해 UserDetails를 구현
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"boards", "comments"})
@EqualsAndHashCode(of = "id")
public class User implements UserDetails {

    /**
     * 사용자 ID (기본 키, 자동 증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 사용자 이름 (로그인 ID로 사용됨)
     */
    @Column(name = "user_name", nullable = false, unique = true, length = 50)
    private String userName;

    /**
     * 사용자 비밀번호
     */
    @Column(nullable = false, length = 100)
    private String password;

    /**
     * 사용자 권한/역할 (예: ROLE_USER, ROLE_ADMIN)
     */
    @Column(nullable = false, length = 20)
    private String role;

    /**
     * 계정 생성 시각
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 계정 수정 시각
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 사용자가 작성한 게시글 목록
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Board> boards = new ArrayList<>();

    /**
     * 사용자가 작성한 댓글 목록
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    /**
     * 사용자 생성 시 자동 설정
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (this.role == null) {
            this.role = "ROLE_USER";
        }
    }

    /**
     * 사용자 정보 수정 시 자동 설정
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // -------------------------------
    // UserDetails 인터페이스 구현
    // -------------------------------

    /**
     * 사용자의 권한 목록을 반환합니다.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.role));
    }

    /**
     * 로그인에 사용할 사용자명 반환
     */
    @Override
    public String getUsername() {
        return this.userName;
    }

    /**
     * 계정 만료 여부
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * 계정 잠금 여부
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * 자격 증명(비밀번호) 만료 여부
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * 계정 활성화 여부
     */
    @Override
    public boolean isEnabled() {
        return true;
    }
}
