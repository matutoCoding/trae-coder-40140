import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { CrisisQuestion, CrisisLevel, PriorityLevel } from '@/types';
import { useQueueStore } from '@/store/queueStore';
import styles from './index.module.scss';

const CRISIS_QUESTIONS: CrisisQuestion[] = [
  {
    id: 'q1',
    question: '最近两周内，您是否有过自杀的想法？',
    category: '自杀风险',
    options: [
      { value: 0, label: '完全没有', level: 'low' as CrisisLevel },
      { value: 2, label: '偶尔有想法', level: 'medium' as CrisisLevel },
      { value: 4, label: '经常有想法', level: 'high' as CrisisLevel },
      { value: 6, label: '有明确计划', level: 'critical' as CrisisLevel }
    ]
  },
  {
    id: 'q2',
    question: '您是否有过自伤行为？',
    category: '自伤风险',
    options: [
      { value: 0, label: '从未有过', level: 'low' as CrisisLevel },
      { value: 2, label: '过去有过', level: 'medium' as CrisisLevel },
      { value: 4, label: '近期有过', level: 'high' as CrisisLevel },
      { value: 6, label: '频繁发生', level: 'critical' as CrisisLevel }
    ]
  },
  {
    id: 'q3',
    question: '您目前的情绪状态如何？',
    category: '情绪状态',
    options: [
      { value: 0, label: '情绪稳定', level: 'low' as CrisisLevel },
      { value: 1, label: '偶尔低落', level: 'low' as CrisisLevel },
      { value: 3, label: '持续低落', level: 'medium' as CrisisLevel },
      { value: 5, label: '极度痛苦', level: 'high' as CrisisLevel }
    ]
  },
  {
    id: 'q4',
    question: '您是否感到绝望或对未来失去信心？',
    category: '绝望感',
    options: [
      { value: 0, label: '完全没有', level: 'low' as CrisisLevel },
      { value: 2, label: '偶尔感到', level: 'medium' as CrisisLevel },
      { value: 4, label: '经常感到', level: 'high' as CrisisLevel },
      { value: 6, label: '极度绝望', level: 'critical' as CrisisLevel }
    ]
  },
  {
    id: 'q5',
    question: '您是否有可以依靠的家人或朋友？',
    category: '社会支持',
    options: [
      { value: 0, label: '有很多支持', level: 'low' as CrisisLevel },
      { value: 1, label: '有一些支持', level: 'low' as CrisisLevel },
      { value: 3, label: '支持很少', level: 'medium' as CrisisLevel },
      { value: 5, label: '完全没有支持', level: 'high' as CrisisLevel }
    ]
  },
  {
    id: 'q6',
    question: '您是否有睡眠问题？',
    category: '睡眠状况',
    options: [
      { value: 0, label: '睡眠正常', level: 'low' as CrisisLevel },
      { value: 1, label: '偶尔失眠', level: 'low' as CrisisLevel },
      { value: 2, label: '经常失眠', level: 'medium' as CrisisLevel },
      { value: 4, label: '严重失眠', level: 'high' as CrisisLevel }
    ]
  }
];

const CrisisAssessPage: React.FC = () => {
  const { currentPatient, clinics, getTreatmentItems, addQueueRecord, setSelectedClinicId } = useQueueStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<string>('c001');

  const totalQuestions = CRISIS_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const currentQuestion = CRISIS_QUESTIONS[currentIndex];

  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  }, [answers]);

  const crisisLevel = useMemo((): { level: CrisisLevel; label: string; desc: string } => {
    if (totalScore >= 20) {
      return {
        level: 'critical',
        label: '极高危',
        desc: '存在严重的危机风险，需要立即干预。建议立即联系精神科医生或心理危机干预热线。'
      };
    } else if (totalScore >= 12) {
      return {
        level: 'high',
        label: '高危',
        desc: '存在较高的危机风险，建议尽快就诊精神科，必要时安排优先就诊。'
      };
    } else if (totalScore >= 6) {
      return {
        level: 'medium',
        label: '中危',
        desc: '存在一定的心理困扰，建议预约心理咨询或精神科门诊进行评估。'
      };
    } else {
      return {
        level: 'low',
        label: '低危',
        desc: '目前心理状态较为稳定，建议保持规律作息，如有需要可预约常规门诊。'
      };
    }
  }, [totalScore]);

  const queuePriority = useMemo((): PriorityLevel => {
    switch (crisisLevel.level) {
      case 'critical':
        return 'crisis';
      case 'high':
        return 'urgent';
      default:
        return 'normal';
    }
  }, [crisisLevel]);

  const priorityLabel = useMemo(() => {
    const labels: Record<PriorityLevel, string> = {
      crisis: '危急优先',
      urgent: '加急',
      normal: '普通'
    };
    return labels[queuePriority];
  }, [queuePriority]);

  const openClinics = useMemo(() => 
    clinics.filter(c => c.status === 'open'),
    [clinics]
  );

  const suggestions = useMemo(() => {
    const baseSuggestions = [
      '如有紧急情况，请立即拨打心理危机干预热线：400-161-9995',
      '保持规律的作息时间，保证充足睡眠',
      '与信任的家人或朋友保持联系'
    ];

    if (crisisLevel.level === 'critical') {
      return [
        '请立即拨打120或前往最近的医院急诊科',
        '请务必有家人陪伴，不要独处',
        '可拨打心理危机干预热线：400-161-9995',
        '系统将自动安排优先就诊'
      ];
    } else if (crisisLevel.level === 'high') {
      return [
        '建议尽快预约精神科门诊就诊',
        '请告知家人您的状况，寻求支持',
        '避免独处，保持与外界的联系',
        '系统将为您安排加急排队'
      ];
    } else if (crisisLevel.level === 'medium') {
      return [
        '建议预约心理咨询或精神科门诊',
        '尝试进行放松训练和呼吸练习',
        '保持适度的运动和社交活动',
        ...baseSuggestions.slice(1)
      ];
    }
    return baseSuggestions;
  }, [crisisLevel]);

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    Taro.showLoading({ title: '提交中...' });
    
    setTimeout(() => {
      Taro.hideLoading();
      setShowResult(true);
    }, 1000);
  };

  const handlePriorityQueue = () => {
    const clinic = clinics.find(c => c.id === selectedClinic);
    if (!clinic) return;

    const treatmentItems = getTreatmentItems(selectedClinic);
    const defaultTreatment = treatmentItems[0];
    if (!defaultTreatment) return;

    Taro.showModal({
      title: '确认取号',
      content: `确定前往【${clinic.name}】就诊吗？\n优先级：${priorityLabel}`,
      success: (res) => {
        if (res.confirm) {
          addQueueRecord({
            patientId: currentPatient.id,
            patientName: currentPatient.name,
            clinicId: selectedClinic,
            clinicName: clinic.name,
            treatmentItemIds: [defaultTreatment.id],
            treatmentItemNames: [defaultTreatment.name],
            totalDuration: defaultTreatment.duration,
            priority: queuePriority
          });

          setSelectedClinicId(selectedClinic);

          Taro.showToast({
            title: '取号成功',
            icon: 'success',
            duration: 1500
          });

          setTimeout(() => {
            Taro.switchTab({ url: '/pages/queue/index' });
          }, 1500);
        }
      }
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  const selectedValue = answers[currentQuestion?.id];
  const hasAnswer = selectedValue !== undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const isCriticalTriggered = Object.entries(answers).some(([qId, val]) => {
    const question = CRISIS_QUESTIONS.find(q => q.id === qId);
    const option = question?.options.find(o => o.value === val);
    return option?.level === 'critical';
  });

  if (showResult) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.title}>评估结果</Text>
          <Text className={styles.subtitle}>
            基于您的回答，系统生成以下评估建议
          </Text>
        </View>

        <View className={styles.content}>
          <View className={styles.resultCard}>
            <View className={classnames(styles.resultLevel, styles[crisisLevel.level])}>
              <Text className={styles.resultLevelText}>{crisisLevel.label}</Text>
              <Text className={styles.resultScore}>得分：{totalScore}分</Text>
            </View>
            <Text className={styles.resultTitle}>危机等级评估</Text>
            <Text className={styles.resultDesc}>{crisisLevel.desc}</Text>

            <View className={styles.suggestions}>
              <Text className={styles.suggestionsTitle}>📋 建议措施</Text>
              {suggestions.map((item, index) => (
                <View key={index} className={styles.suggestionItem}>
                  <Text className={styles.suggestionBullet}>•</Text>
                  <Text className={styles.suggestionText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.infoCard}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>就诊人</Text>
              <Text className={styles.infoValue}>{currentPatient.name}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>评估时间</Text>
              <Text className={styles.infoValue}>
                {new Date().toLocaleString('zh-CN')}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>推荐优先级</Text>
              <Text className={styles.infoValue} style={{ color: queuePriority === 'crisis' ? '#ff4d4f' : queuePriority === 'urgent' ? '#fa8c16' : '#1677ff' }}>
                {priorityLabel}
              </Text>
            </View>
          </View>

          <View className={styles.section} style={{ marginTop: '24rpx' }}>
            <Text className={styles.sectionTitle}>选择就诊诊室</Text>
            <View className={styles.clinicList}>
              {openClinics.map(clinic => (
                <View
                  key={clinic.id}
                  className={classnames(styles.clinicOption, {
                    [styles.selected]: selectedClinic === clinic.id
                  })}
                  onClick={() => setSelectedClinic(clinic.id)}
                >
                  <View className={styles.clinicOptionInfo}>
                    <Text className={styles.clinicOptionName}>{clinic.name}</Text>
                    <Text className={styles.clinicOptionDesc}>
                      {clinic.doctorName} · {clinic.location}
                    </Text>
                  </View>
                  {selectedClinic === clinic.id && (
                    <View className={styles.checkIcon}>✓</View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.bottomBar}>
          <Button 
            className={classnames(styles.navBtn, styles.ghost)}
            onClick={handleRestart}
          >
            重新评估
          </Button>
          <Button 
            className={classnames(styles.navBtn, crisisLevel.level === 'critical' || crisisLevel.level === 'high' ? styles.danger : styles.primary)}
            onClick={handlePriorityQueue}
          >
            {crisisLevel.level === 'critical' || crisisLevel.level === 'high' 
              ? '立即优先就诊' 
              : '加入普通排队'}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>危机评估</Text>
        <Text className={styles.subtitle}>
          请如实回答以下问题，帮助医生了解您的状况
        </Text>
        <View className={styles.progressBar}>
          <View 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }} 
          />
        </View>
        <Text className={styles.progressText}>
          {answeredCount} / {totalQuestions}
        </Text>
      </View>

      <View className={styles.content}>
        <View className={styles.questionCard}>
          <Text className={styles.questionIndex}>
            第 {currentIndex + 1} 题 / 共 {totalQuestions} 题 · {currentQuestion.category}
          </Text>
          <Text className={styles.questionText}>
            {currentQuestion.question}
          </Text>

          <View className={styles.options}>
            {currentQuestion.options.map((option) => (
              <View
                key={option.value}
                className={classnames(
                  styles.optionItem,
                  { [styles.selected]: selectedValue === option.value },
                  option.level !== 'low' ? styles[option.level] : null
                )}
                onClick={() => handleAnswer(option.value)}
              >
                <Text className={styles.optionText}>{option.label}</Text>
              </View>
            ))}
          </View>

          {isCriticalTriggered && (
            <View className={styles.dangerWarning}>
              <Text className={styles.warningIcon}>⚠️</Text>
              <Text className={styles.warningText}>
                注意：您的回答显示可能存在较高的风险。如果您正处于紧急情况，请立即拨打心理危机干预热线 400-161-9995 或前往就近医院。
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button 
          className={classnames(styles.navBtn, styles.ghost)}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          上一题
        </Button>
        <Button 
          className={classnames(styles.navBtn, styles.primary)}
          onClick={isLastQuestion ? handleSubmit : handleNext}
          disabled={!hasAnswer}
        >
          {isLastQuestion ? '提交评估' : '下一题'}
        </Button>
      </View>
    </View>
  );
};

export default CrisisAssessPage;
