package demo.demo_back.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data // @Data는 @Getter, @Setter, @ToString, @EqualsAndHashCode 등을 포함
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ERD에 맞춰 user_name 컬럼에 매핑
    @Column(name = "user_name", nullable = false, unique = true, length = 50)
    private String userName;

    // ERD에 맞춰 password 컬럼에 매핑
    @Column(nullable = false, length = 100)
    private String password;

    // ERD에 없는 nickname 필드 삭제됨

    // ERD에 맞춰 created_at 컬럼에 매핑
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // ERD에 맞춰 updated_at 컬럼에 매핑 (nullable)
    @Column(name = "updated_at") // nullable = true가 기본값이므로 명시적으로 false를 붙이지 않음
    private LocalDateTime updatedAt;

    // ERD에 없는 is_deleted 필드 삭제됨

    // User가 작성한 게시물 목록 (Board의 user 필드에 의해 매핑됨)
    // 양방향 관계 설정 시 순환 참조 방지 어노테이션 필수
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Board> boards;

    // User가 작성한 댓글 목록 (Comment의 user 필드에 의해 매핑됨)
    // 양방향 관계 설정 시 순환 참조 방지 어노테이션 필수
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Comment> comments;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // updatedAt은 ERD에서 nullable이므로 생성 시점에 여기서 설정하지 않음 (DB 기본값에 맡기거나 첫 업데이트까지 null 유지)
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // 수정 시각 업데이트
    }
}