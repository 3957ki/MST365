package demo.demo_back.repository;

import demo.demo_back.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findAllByIsDeletedFalseOrderByCreatedAtDesc();
    Optional<Board> findByIdAndIsDeletedFalse(Long id);

    List<Board> findByUserIdAndIsDeletedFalse(Long userId);


} 