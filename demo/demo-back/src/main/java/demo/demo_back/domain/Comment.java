package demo.demo_back.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data // @Data는 @Getter, @Setter, @ToString, @EqualsAndHashCode 등을 포함
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 댓글 작성자 User Entity 참조 (ManyToOne 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 댓글이 속한 Board Entity 참조 (ManyToOne 관계)
    // Board Entity의 comments 필드에 @OneToMany 관계가 설정되어 있다면
    // Comment 쪽에서는 @ToString.Exclude 등을 붙일 필요가 없습니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    // 댓글 내용 컬럼
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // 댓글 생성 시각 컬럼
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 댓글 최종 수정 시각 컬럼 (nullable)
    @Column(name = "updated_at") // ERD에 맞춰 nullable = true (기본값)으로 변경
    private LocalDateTime updatedAt;

    // 소프트 삭제 플래그 컬럼
    @Column(name = "is_deleted", nullable = false) // ERD에서 NN이므로 nullable=false 유지
    private boolean isDeleted;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // updatedAt은 ERD에서 nullable이므로 생성 시점에 여기서 설정하지 않음 (필요시)
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // 수정 시각 업데이트
    }
}