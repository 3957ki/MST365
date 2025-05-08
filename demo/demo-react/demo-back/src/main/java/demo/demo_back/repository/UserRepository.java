package demo.demo_back.repository;

import demo.demo_back.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// User Entity와 Long 타입의 기본 키를 사용하는 Spring Data JPA Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 사용자 이름(userName)으로 User Entity를 찾는 커스텀 쿼리 메소드
    // Spring Data JPA가 메소드 이름을 파싱하여 JPQL 또는 SQL 쿼리를 자동으로 생성합니다.
    Optional<User> findByUserName(String userName);

    // ERD에 email 컬럼이 없으므로 findByEmail 메소드는 삭제합니다.
    // Optional<User> findByEmail(String email);
}