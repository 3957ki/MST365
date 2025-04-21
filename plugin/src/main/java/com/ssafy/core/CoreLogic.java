package com.ssafy.core;

import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CoreLogic {
    private static final Logger log = LoggerFactory.getLogger(CoreLogic.class);

    /** 입력값을 받아서 처리한 결과를 반환 */
    public String process(String input) {
        String val = Strings.nullToEmpty(input).trim().toUpperCase();
        log.info("CoreLogic.process: {}", val);
        // …복잡한 로직 대신 예시
        return "Processed(" + val + ")";
    }
}