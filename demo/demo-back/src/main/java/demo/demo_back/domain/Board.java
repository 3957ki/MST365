package demo.demo_back.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 게시물(Board) 엔티티 클래스.
 * 사용자(User)와 연결되며, 댓글(Comment)과 일대다 관계를 가짐.
 */
@Entity
@Table(name = "boards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "comments")
@EqualsAndHashCode(of = "id")
public class Board {

    /**
     * 게시물 ID (기본 키, 자동 증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 게시물 작성자 (User 엔티티와 다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 게시물 제목 (최대 200자)
     */
    @Column(nullable = false, length = 200)
    private String title;

    /**
     * 게시물 본문 내용 (TEXT 타입)
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 조회수 (기본값 0)
     */
    @Column(name = "view", nullable = false)
    private int view = 0;

    /**
     * 생성일시 (자동 생성)
     */
    @CreationTimestamp
    private LocalDateTime createdAt;

    /**
     * 수정일시 (자동 업데이트)
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * 삭제 여부 (true면 삭제된 상태)
     */
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    /**
     * 삭제된 시점 (isDeleted가 true일 때만 값 존재)
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * 게시물에 달린 댓글 목록 (일대다 관계, 댓글 삭제 시 자동 제거)
     */
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    /**
     * 게시물 수정 전 후처리: 삭제 상태일 경우 삭제 시각 설정
     */
    @PreUpdate
    protected void onUpdate() {
        if (isDeleted && deletedAt == null) {
            deletedAt = LocalDateTime.now();
        }
    }
}
