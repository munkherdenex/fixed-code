import React, { useState } from 'react';
import {
  EuiSplitPanel,
  EuiPanel,
  EuiButtonGroup,
  EuiLoadingSpinner,
  EuiToolTip,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { addToast } from '@/components/toast';
import contactLogApi from '@/api/contact_log';

interface SentimentAnalysisPanelProps {
  callDetails: any;
  isLoading: boolean;
  mutateCallDetail: any;
}

const sentimentOptions = [
  {
    id: 'normal',
    label: '😐',
    name: 'Хэвийн',
  },
  {
    id: 'happy',
    label: '😊',
    name: 'Сэтгэл ханамжтай',
  },
  {
    id: 'unhappy',
    label: '😞',
    name: 'Бухимдалтай',
  },
  {
    id: 'problematic',
    label: '😡',
    name: 'Асуудалтай',
  },
];

const SentimentAnalysisPanel: React.FC<SentimentAnalysisPanelProps> = ({
  callDetails,
  isLoading,
  mutateCallDetail,
}) => {
  const [updating, setUpdating] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState(callDetails?.sentiment || '');

  const isEditable = !callDetails?.sentiment;

  const updateSentiment = async (sentiment: string) => {
    if (!isEditable || updating) return;
    
    setUpdating(true);
    try {
      await contactLogApi.updateContactLogById(callDetails.id, callDetails.body, callDetails.status, sentiment);
      mutateCallDetail((prev: any) => ({ ...prev, sentiment }), false);
      
      addToast({
        id: "sentiment-update-success",
        title: "Сэтгэл ханамжийн үнэлгээг амжилттай хадгаллаа",
        color: "success",
      });
    } catch (error) {
      console.error("Failed to update sentiment:", error);
      addToast({
        id: "sentiment-update-error",
        title: "Сэтгэл ханамжийн үнэлгээг хадгалахад алдаа гарлаа",
        color: "danger",
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderSentimentButton = (option: typeof sentimentOptions[0]) => {
    const isSelected = selectedSentiment === option.id;
    
    const button = (
      <div
        css={css`
          font-size: 1.5rem;
          transition: all 0.2s ease-in-out;
          cursor: ${isEditable && !updating ? 'pointer' : 'default'};
          opacity: ${isSelected || !selectedSentiment ? 1 : 0.5};
          padding: 8px 12px;
          border-radius: 8px;
          border: ${isSelected ? '2px solid #0077cc' : '2px solid transparent'};
          background-color: ${isSelected ? 'rgba(0, 119, 204, 0.1)' : 'transparent'};
          box-shadow: ${isSelected ? '0 2px 8px rgba(0, 119, 204, 0.2)' : 'none'};
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          ${isEditable && !updating ? '&:hover { transform: scale(1.2); }' : ''}
        `}
        onClick={() => {
          if (isEditable && !updating) {
            setSelectedSentiment(option.id);
            updateSentiment(option.id);
          }
        }}
      >
        {option.label}
      </div>
    );

    return (
      <EuiToolTip content={option.name} position="bottom">
        {button}
      </EuiToolTip>
    );
  };

  return (
    <EuiSplitPanel.Outer hasShadow={false} hasBorder>
      <EuiSplitPanel.Inner color="subdued" paddingSize="m">
        Сэтгэл ханамжийн үнэлгээ
      </EuiSplitPanel.Inner>
      <EuiPanel paddingSize="m">
        {isLoading || updating ? (
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 10px;
            `}
          >
            <EuiLoadingSpinner size="m" />
          </div>
        ) : (
          <div
            css={css`
              display: flex;
              justify-content: space-around;
              padding: 10px;
              opacity: ${isEditable ? 1 : 0.8};
            `}
          >
            {sentimentOptions.map((option) => (
              <div key={option.id}>
                {renderSentimentButton(option)}
              </div>
            ))}
          </div>
        )}
      </EuiPanel>
    </EuiSplitPanel.Outer>
  );
};

export default SentimentAnalysisPanel;