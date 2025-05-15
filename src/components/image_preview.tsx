import React, { useState, useEffect } from "react";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiImage,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from "@elastic/eui";

interface ImagePreviewProps {
  fileUrl: string;
  altText?: string;
  width?: number | string;
  height?: number | string;
  allowFullScreen?: boolean;
  caption?: string;
  thumbnailSize?: number | string;
  modalTitle?: string;
  onError?: (error: Error) => void;
  closePopup: Function;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  fileUrl,
  altText = "Image preview",
  width = "100%",
  height = "auto",
  allowFullScreen = true,
  caption,
  thumbnailSize = 100,
  modalTitle = "Файл",
  onError,
  closePopup,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);

  useEffect(() => {
    // Reset states when fileUrl changes
    setIsLoading(true);
    setHasError(false);
  }, [fileUrl]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(new Error("Failed to load image"));
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    closePopup();
  };

  const closeModal = () => {
    closePopup();
  };

  return (
    <EuiOverlayMask>
      <EuiModal
        onClose={closeModal}
        maxWidth={isFullScreen ? true : 900}
        style={{
          width: isFullScreen ? "95vw" : "auto",
          maxHeight: isFullScreen ? "95vh" : "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <EuiModalHeader>
          <EuiModalHeaderTitle>{modalTitle}</EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiFlexGroup direction="column" gutterSize="s">
            <EuiFlexItem>
              {isLoading && (
                <EuiFlexGroup
                  alignItems="center"
                  justifyContent="center"
                  style={{ minHeight: "200px" }}
                >
                  <EuiFlexItem grow={false}>
                    <EuiLoadingSpinner size="l" />
                  </EuiFlexItem>
                </EuiFlexGroup>
              )}

              {hasError && (
                <EuiFlexGroup
                  alignItems="center"
                  justifyContent="center"
                  style={{ minHeight: "200px" }}
                >
                  <EuiFlexItem grow={false}>
                    <EuiText color="danger" size="s">
                      Алдаа гарлаа. Файл татна уу.
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              )}

              <div
                style={{
                  display: isLoading || hasError ? "none" : "block",
                  textAlign: "center",
                  maxHeight: isFullScreen ? "85vh" : "70vh",
                  overflow: "auto",
                }}
              >
                <EuiImage
                  src={fileUrl}
                  alt={altText}
                  width={isFullScreen ? "auto" : width}
                  height={isFullScreen ? "auto" : height}
                  style={{
                    maxWidth: "100%",
                    maxHeight: isFullScreen ? "85vh" : "70vh",
                    objectFit: "contain",
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </EuiFlexItem>

            {caption && !isLoading && !hasError && (
              <EuiFlexItem>
                <EuiText size="s" textAlign="center">
                  <p>{caption}</p>
                </EuiText>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            {/* <EuiFlexItem grow={false}>
              {allowFullScreen && !isLoading && !hasError && (
                <EuiToolTip content={isFullScreen ? "Exit full screen" : "Full screen"}>
                  <EuiButtonEmpty
                    iconType={isFullScreen ? "exit" : "fullScreen"}
                    onClick={toggleFullScreen}
                  >
                    {isFullScreen ? "Exit full screen" : "Full screen"}
                  </EuiButtonEmpty>
                </EuiToolTip>
              )}
            </EuiFlexItem> */}
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty iconType="download" onClick={downloadFile}>
                Татах
              </EuiButtonEmpty>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButton onClick={closeModal} fill>
                Close
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};

export default ImagePreview;
