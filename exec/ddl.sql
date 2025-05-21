-- -----------------------------------------------------
-- Database Schema for Board Application
-- -----------------------------------------------------

-- 데이터베이스 생성
-- 데이터베이스 이름은 'ssafy'입니다.
-- 이미 'ssafy' 데이터베이스가 있다면 이 라인은 주석 처리하거나 건너뛰셔도 됩니다.
CREATE DATABASE IF NOT EXISTS `ssafy`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 사용할 데이터베이스 선택
-- 이제 'ssafy' 데이터베이스를 사용합니다.
USE `ssafy`;

-- -----------------------------------------------------
-- Table `ssafy`.`users`
-- -----------------------------------------------------
-- 사용자 정보를 저장하는 테이블
CREATE TABLE IF NOT EXISTS `ssafy`.`users` (
                                               `id` INT NOT NULL AUTO_INCREMENT,
                                               `user_name` VARCHAR(50) NOT NULL COMMENT '사용자 이름 (고유)',
    `password` VARCHAR(100) NOT NULL COMMENT '비밀번호 (해시 값 저장)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '계정 생성 시각',
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '계정 정보 최종 수정 시각',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `user_name_UNIQUE` (`user_name` ASC) COMMENT '사용자 이름은 중복 불가'
    ) ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '사용자 정보 테이블';

-- -----------------------------------------------------
-- Table `ssafy`.`boards`
-- -----------------------------------------------------
-- 게시물 정보를 저장하는 테이블
CREATE TABLE IF NOT EXISTS `ssafy`.`boards` (
                                                `id` INT NOT NULL AUTO_INCREMENT,
                                                `user_id` INT NOT NULL COMMENT '게시물 작성자 ID (users 테이블 참조)',
                                                `title` VARCHAR(200) NOT NULL COMMENT '게시물 제목',
    `content` TEXT NOT NULL COMMENT '게시물 내용',
    `view` INT NOT NULL DEFAULT 0 COMMENT '조회수',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '게시물 생성 시각',
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '게시물 최종 수정 시각',
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '소프트 삭제 여부',
    `deleted_at` TIMESTAMP NULL COMMENT '소프트 삭제 시각',
    PRIMARY KEY (`id`),
    INDEX `fk_boards_users_idx` (`user_id` ASC) COMMENT '사용자 ID 인덱스',
    CONSTRAINT `fk_boards_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `ssafy`.`users` (`id`) -- 외래 키 참조 시 데이터베이스 이름 명시
                                                          ON DELETE CASCADE -- 사용자가 삭제되면 해당 사용자의 게시물도 삭제 (소프트 삭제 로직이 우선 적용될 수 있음)
                                                          ON UPDATE CASCADE -- 사용자 ID가 업데이트되면 게시물의 user_id도 업데이트
    ) ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '게시물 정보 테이블';

-- -----------------------------------------------------
-- Table `ssafy`.`comments`
-- -----------------------------------------------------
-- 댓글 정보를 저장하는 테이블
CREATE TABLE IF NOT EXISTS `ssafy`.`comments` (
                                                  `id` INT NOT NULL AUTO_INCREMENT,
                                                  `user_id` INT NOT NULL COMMENT '댓글 작성자 ID (users 테이블 참조)',
                                                  `board_id` INT NOT NULL COMMENT '댓글이 속한 게시물 ID (boards 테이블 참조)',
                                                  `content` TEXT NOT NULL COMMENT '댓글 내용',
                                                  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '댓글 생성 시각',
                                                  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '댓글 최종 수정 시각',
                                                  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '소프트 삭제 여부',
                                                  `deleted_at` TIMESTAMP NULL COMMENT '소프트 삭제 시각',
                                                  PRIMARY KEY (`id`),
    INDEX `fk_comments_users_idx` (`user_id` ASC) COMMENT '사용자 ID 인덱스',
    INDEX `fk_comments_boards_idx` (`board_id` ASC) COMMENT '게시물 ID 인덱스',
    CONSTRAINT `fk_comments_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `ssafy`.`users` (`id`) -- 외래 키 참조 시 데이터베이스 이름 명시
    ON DELETE CASCADE -- 사용자가 삭제되면 해당 사용자의 댓글도 삭제 (소프트 삭제 로직이 우선 적용될 수 있음)
    ON UPDATE CASCADE, -- 사용자 ID가 업데이트되면 댓글의 user_id도 업데이트
    CONSTRAINT `fk_comments_boards`
    FOREIGN KEY (`board_id`)
    REFERENCES `ssafy`.`boards` (`id`) -- 외래 키 참조 시 데이터베이스 이름 명시
    ON DELETE CASCADE -- 게시물이 삭제되면 해당 게시물의 댓글도 삭제 (소프트 삭제 로직이 우선 적용될 수 있음)
    ON UPDATE CASCADE -- 게시물 ID가 업데이트되면 댓글의 board_id도 업데이트
    ) ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_unicode_ci
    COMMENT = '댓글 정보 테이블';