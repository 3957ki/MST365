// src/plugins/ci/jenkins/index.js
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { getJenkinsConfig } from '../../../utils/config.js';
import JenkinsLogger from '../../../utils/jenkins-logger.js';
import { tSync } from '../../../utils/i18n.js';

/**
 * Jenkins CI/CD 통합 플러그인
 */
class JenkinsPlugin {
  /**
   * 플러그인 초기화
   * @param {Object} options 플러그인 옵션
   */
  constructor(options = {}) {
    this.options = options;
    this.logger = null;
    this.initialized = false;
  }
  
  /**
   * 플러그인 초기화
   */
  async initialize() {
    if (this.initialized) return;
    
    // Jenkins 설정 로드
    const config = await getJenkinsConfig();
    
    // 옵션과 설정 병합
    this.config = {
      ...config,
      ...this.options
    };
    
    // Jenkins 로거 초기화
    this.logger = new JenkinsLogger(this.config);
    
    this.initialized = true;
    return this;
  }
  
  /**
   * Jenkins 빌드 콘솔 출력 분석
   * @param {string} jobName 작업 이름 (선택 사항)
   * @param {string|number} buildNumber 빌드 번호 (선택 사항)
   * @returns {Promise<Object>} 분석 결과
   */
  async analyzeBuild(jobName, buildNumber) {
    await this.initialize();
    
    try {
      // 콘솔 출력 가져오기
      const consoleOutput = await this.logger.fetchConsoleOutput(
        jobName || this.config.jenkinsJob,
        buildNumber || 'lastBuild'
      );
      
      // 빌드 실패 분석
      const analysis = this.logger.analyzeFailure(consoleOutput);
      
      return {
        consoleOutput,
        analysis
      };
    } catch (error) {
      console.error(tSync('jenkins_console_error'), error.message);
      throw error;
    }
  }
  
  /**
   * Jenkins 파이프라인에서 테스트 실행
   * @param {Object} testConfig 테스트 설정
   * @returns {Promise<Object>} 테스트 결과
   */
  async runInPipeline(testConfig) {
    await this.initialize();
    
    // 현재 Jenkins 실행 환경인지 확인
    const isJenkinsPipeline = process.env.JENKINS_URL && process.env.BUILD_ID;
    
    if (!isJenkinsPipeline) {
      console.warn(tSync('not_jenkins_environment'));
      return null;
    }
    
    try {
      // Jenkins 환경 변수
      const buildId = process.env.BUILD_ID;
      const buildUrl = process.env.BUILD_URL;
      const jobName = process.env.JOB_NAME;
      const workspacePath = process.env.WORKSPACE;
      
      console.log(tSync('jenkins_test_running'), {
        jobName,
        buildId,
        workspace: workspacePath
      });
      
      // 테스트 설정 준비 (구현 필요)
      
      return {
        buildId,
        buildUrl,
        jobName,
        status: 'completed'
      };
    } catch (error) {
      console.error(tSync('jenkins_test_error'), error.message);
      throw error;
    }
  }
  
  /**
   * Jenkins 작업 생성
   * @param {Object} jobConfig 작업 설정
   * @returns {Promise<Object>} 생성된 작업 정보
   */
  async createJob(jobConfig) {
    await this.initialize();
    
    try {
      const jobName = jobConfig.name;
      const jobXml = this.generateJobXml(jobConfig);
      
      // Jenkins API로 작업 생성
      const url = `${this.config.jenkinsUrl}/createItem?name=${encodeURIComponent(jobName)}`;
      const auth = this.config.jenkinsUser && this.config.jenkinsToken
        ? { username: this.config.jenkinsUser, password: this.config.jenkinsToken }
        : undefined;
      
      const response = await axios({
        method: 'post',
        url,
        headers: {
          'Content-Type': 'application/xml'
        },
        auth,
        data: jobXml
      });
      
      return {
        name: jobName,
        url: `${this.config.jenkinsUrl}/job/${encodeURIComponent(jobName)}/`,
        status: response.status
      };
    } catch (error) {
      console.error(tSync('jenkins_create_job_error'), error.message);
      throw error;
    }
  }
  
  /**
   * Jenkins 작업 XML 생성
   * @param {Object} config 작업 설정
   * @returns {string} 작업 XML 설정
   */
  generateJobXml(config) {
    // Jenkins 작업 XML 템플릿을 렌더링해 반환
    // (실제 구현은 템플릿 엔진 사용 또는 문자열 치환)
    
    const template = `<?xml version='1.1' encoding='UTF-8'?>
<project>
  <description>${config.description || 'LLM-Driven Test Job'}</description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <scm class="hudson.scm.NullSCM"/>
  <canRoam>true</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <triggers/>
  <concurrentBuild>false</concurrentBuild>
  <builders>
    <hudson.tasks.Shell>
      <command>#!/bin/bash
npm install -g llm-test
llm-test run -f ${config.testFile || 'test.txt'} -o ${config.outputDir || 'test-results'} --ci
      </command>
    </hudson.tasks.Shell>
  </builders>
  <publishers/>
  <buildWrappers/>
</project>`;
    
    return template;
  }
  
  /**
   * 테스트 보고서 업로드
   * @param {string} reportPath 보고서 경로
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadReport(reportPath) {
    await this.initialize();
    
    // Jenkins 환경 변수 확인
    const buildUrl = process.env.BUILD_URL;
    const artifactsUrl = `${buildUrl}artifact/`;
    
    try {
      // 현재 Jenkins 빌드인 경우 아티팩트로 복사
      if (process.env.JENKINS_URL && process.env.WORKSPACE) {
        const artifactsDir = path.join(process.env.WORKSPACE, 'llm-test-reports');
        await fs.ensureDir(artifactsDir);
        
        // 보고서 복사
        const reportFileName = path.basename(reportPath);
        const destPath = path.join(artifactsDir, reportFileName);
        await fs.copy(reportPath, destPath);
        
        return {
          success: true,
          reportUrl: `${artifactsUrl}llm-test-reports/${reportFileName}`,
          message: tSync('jenkins_report_uploaded')
        };
      } else {
        // Jenkins 환경이 아닌 경우 API로 업로드 (미구현)
        console.warn(tSync('jenkins_upload_not_implemented'));
        return {
          success: false,
          message: tSync('not_jenkins_environment')
        };
      }
    } catch (error) {
      console.error(tSync('jenkins_upload_error'), error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default JenkinsPlugin;