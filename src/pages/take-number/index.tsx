import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useQueueStore } from '@/store/queueStore';
import { Clinic, TreatmentItem } from '@/types';
import { formatDuration } from '@/utils/time';
import styles from './index.module.scss';

const TakeNumberPage: React.FC = () => {
  const { clinics, getTreatmentItems, currentPatient, addQueueRecord, getWaitingList } = useQueueStore();
  
  const [selectedClinic, setSelectedClinic] = useState<string>('c001');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const openClinics = useMemo(() => 
    clinics.filter(c => c.status === 'open'),
    [clinics]
  );

  const treatmentItems = useMemo(() => 
    getTreatmentItems(selectedClinic),
    [getTreatmentItems, selectedClinic]
  );

  const selectedTreatmentDetails = useMemo(() => 
    treatmentItems.filter(t => selectedTreatments.includes(t.id)),
    [treatmentItems, selectedTreatments]
  );

  const totalPrice = useMemo(() => 
    selectedTreatmentDetails.reduce((sum, t) => sum + t.price, 0),
    [selectedTreatmentDetails]
  );

  const totalDuration = useMemo(() => 
    selectedTreatmentDetails.reduce((sum, t) => sum + t.duration, 0),
    [selectedTreatmentDetails]
  );

  const waitingCount = useMemo(() => 
    getWaitingList(selectedClinic).length,
    [getWaitingList, selectedClinic]
  );

  const handleClinicSelect = (clinicId: string) => {
    setSelectedClinic(clinicId);
    setSelectedTreatments([]);
  };

  const handleTreatmentToggle = (treatmentId: string) => {
    setSelectedTreatments(prev => {
      if (prev.includes(treatmentId)) {
        return prev.filter(id => id !== treatmentId);
      }
      return [...prev, treatmentId];
    });
  };

  const handleSubmit = () => {
    if (selectedTreatments.length === 0) {
      Taro.showToast({ title: '请选择诊疗项目', icon: 'none' });
      return;
    }

    const clinic = clinics.find(c => c.id === selectedClinic);
    if (!clinic) return;

    addQueueRecord({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      clinicId: selectedClinic,
      clinicName: clinic.name,
      treatmentItemIds: selectedTreatments,
      treatmentItemNames: selectedTreatmentDetails.map(t => t.name),
      totalDuration,
      priority: 'normal'
    });

    Taro.showToast({
      title: '取号成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      }
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>选择诊室</Text>
          <View className={styles.clinicList}>
            {openClinics.map(clinic => (
              <View
                key={clinic.id}
                className={classnames(styles.clinicOption, {
                  [styles.selected]: selectedClinic === clinic.id
                })}
                onClick={() => handleClinicSelect(clinic.id)}
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

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>选择诊疗项目</Text>
          <View className={styles.treatmentList}>
            {treatmentItems.map((item: TreatmentItem) => (
              <View
                key={item.id}
                className={classnames(styles.treatmentItem, {
                  [styles.selected]: selectedTreatments.includes(item.id)
                })}
                onClick={() => handleTreatmentToggle(item.id)}
              >
                <View className={styles.treatmentHeader}>
                  <Text className={styles.treatmentName}>{item.name}</Text>
                  <Text className={styles.treatmentPrice}>¥{item.price}</Text>
                </View>
                <View className={styles.treatmentMeta}>
                  <Text className={styles.treatmentDuration}>
                    时长：{formatDuration(item.duration)}
                  </Text>
                  {selectedTreatments.includes(item.id) && (
                    <Text className={styles.checkIcon} style={{ width: 'auto', height: 'auto', background: 'none', color: '#1677ff' }}>
                      ✓ 已选
                    </Text>
                  )}
                </View>
                {item.description && (
                  <Text className={styles.treatmentDesc}>{item.description}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>就诊人信息</Text>
          <View className={styles.patientSection}>
            <View className={styles.patientAvatar}>
              <Text>{currentPatient.name.charAt(0)}</Text>
            </View>
            <View className={styles.patientInfo}>
              <Text className={styles.patientName}>{currentPatient.name}</Text>
              <Text className={styles.patientMeta}>
                {currentPatient.gender === 'male' ? '男' : '女'} · {currentPatient.age}岁 · {currentPatient.phone}
              </Text>
            </View>
          </View>
        </View>

        {selectedTreatments.length > 0 && (
          <View className={styles.summarySection}>
            <Text className={styles.summaryTitle}>费用明细</Text>
            {selectedTreatmentDetails.map(item => (
              <View key={item.id} className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>{item.name}</Text>
                <Text className={styles.summaryValue}>¥{item.price}</Text>
              </View>
            ))}
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>预计总时长</Text>
              <Text className={styles.summaryValue}>{formatDuration(totalDuration)}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>预计等待</Text>
              <Text className={styles.summaryValue}>{waitingCount} 人</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>合计</Text>
              <Text className={styles.summaryTotal}>¥{totalPrice}</Text>
            </View>
          </View>
        )}

        <View className={styles.tips}>
          <Text className={styles.tipsTitle}>温馨提示</Text>
          <Text className={styles.tipsText}>
            1. 请在叫号后及时就诊，过号三次将自动作废{'\n'}
            2. 选择多个诊疗项目将自动合并为连续时段{'\n'}
            3. 如需取消请提前30分钟操作
          </Text>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>费用合计</Text>
          <Text className={styles.priceValue}>¥{totalPrice}</Text>
        </View>
        <Button 
          className={styles.submitBtn}
          disabled={selectedTreatments.length === 0}
          onClick={handleSubmit}
        >
          确认取号
        </Button>
      </View>
    </View>
  );
};

export default TakeNumberPage;
