package demo.demo_back.repository;

import demo.demo_back.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByBoardId(Long boardId);

    List<Comment> findByBoard_IdAndIsDeletedFalseOrderByCreatedAtAsc(Long boardId);

    List<Comment> findByUserIdAndIsDeletedFalseAndBoard_IsDeletedFalse(Long userId);


    List<Comment> findByUserId(Long userId);

    List<Comment> findByUserIdAndIsDeletedFalse(Long userId);
}
