import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Models } from "@tapis/tapis-typescript";
import { MLHub as Hooks } from "@tapis/tapisui-hooks";
import {
  QueryWrapper,
  Icon,
  JSONDisplay,
  GenericModal,
} from "@tapis/tapisui-common";
import { Button, Breadcrumb, BreadcrumbItem } from "reactstrap";
import styles from "./ModelDetails.module.scss";
import InferenceServerInfo from "./InferenceServerInfo";
import Markdown from "markdown-to-jsx";

interface ModelDetailsByPlatformParams {
  platform: string;
  modelId: string;
}

type MarkdownProps = {
  children: string;
};

const ModelDetailsByPlatform: React.FC = () => {
  const { platform, modelId } = useParams<ModelDetailsByPlatformParams>();

  // Map UI keys to API enum values; same as ModelsByPlatform
  const PLATFORM_KEY_TO_ENUM: Record<string, string> = {
    HuggingFace: "huggingface",
    Github: "github",
    Git: "git",
    Patra: "patra",
    TaccTapis: "tacc-tapis",
    s3: "s3",
  };

  const apiPlatform =
    PLATFORM_KEY_TO_ENUM[platform] || platform?.toLowerCase() || "";

  const { data, isLoading, error } =
    Hooks.Models.Platforms.useGetModelByPlatform({
      platform: apiPlatform,
      modelId: modelId,
    });

  const model: { [key: string]: any } = data?.result ?? {};

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles["model-details"]}
    >
      <div className="mb-3">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/ml-hub">ML Hub</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to="/ml-hub/models">Models</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/ml-hub/models/platform/${platform}`}>{platform}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>{modelId}</BreadcrumbItem>
        </Breadcrumb>
        <h2>{modelId}</h2>
        <p className="text-muted">Platform: {platform}</p>
      </div>

      <div className={`${styles["model-details-wrapper"]}`}>
        <div className={`${styles["model-details"]}`}>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>author:</div>
            <div className={`${styles["detail-info"]}`}>{model.author}</div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>downloads:</div>
            <div className={`${styles["detail-info"]}`}>{model.downloads}</div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>created_at:</div>
            <div className={`${styles["detail-info"]}`}>{model.created_at}</div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>last_modified:</div>
            <div className={`${styles["detail-info"]}`}>
              {model.last_modified}
            </div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>sha:</div>
            <div className={`${styles["detail-info"]}`}>{model.sha}</div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>
              repository_content:
            </div>
            <div className={`${styles["detail-info"]}`}>
              {model.repository_content && (
                <JSONDisplay json={model.repository_content}></JSONDisplay>
              )}
            </div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>library_name:</div>
            <div className={`${styles["detail-info"]}`}>
              {model.library_name}
            </div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>
              transformers_info:
            </div>
            <div className={`${styles["detail-info"]}`}>
              {model.transformers_info && (
                <JSONDisplay json={model.transformers_info}></JSONDisplay>
              )}
            </div>
          </div>
          <div className={`${styles["model-detail"]}`}>
            <div className={`${styles["detail-title"]}`}>config:</div>
            <div className={`${styles["detail-info"]}`}>
              {model.config && <JSONDisplay json={model.config}></JSONDisplay>}
            </div>
          </div>
        </div>
        <Buttons model={model} />
      </div>
    </QueryWrapper>
  );
};

const Buttons: React.FC<{ model: { [key: string]: any } }> = ({ model }) => {
  const [currentModal, setCurrentModal] = useState<string | undefined>(
    undefined
  );

  // Get the model ID from the platform-specific response
  const modelIdForDownload = model.id || model.model_id;

  const {
    data: downloadLinkData,
    error: downloadLinkError,
    isLoading: downloadLinkIsLoading,
  } = Hooks.Models.useDownloadLinks({ modelId: modelIdForDownload! });
  const downloadLinkInfo: Models.ModelDownloadInfo =
    downloadLinkData?.result ?? {};
  const downloadOnClick = (url: string, filename: string) => {
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        const fileURL = window.URL.createObjectURL(blob);
        let alink = document.createElement("a");
        alink.href = fileURL;
        alink.download = filename;
        document.body.appendChild(alink);
        alink.click();
        document.body.removeChild(alink);

        window.URL.revokeObjectURL(fileURL);
      });
    });
  };

  const {
    data: data2,
    isError,
    error,
  } = Hooks.Models.useModelCardDetails({
    modelId: modelIdForDownload!,
  });

  return (
    <div className={`${styles["buttons-container"]}`}>
      <Button
        onClick={() => {
          setCurrentModal("inferenceinfo");
        }}
      >
        {"Inference Service Info "}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      <Button
        onClick={() => {
          setCurrentModal("downloadmodel");
        }}
      >
        {"Download Model "}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      <Button
        onClick={() => {
          setCurrentModal("modelcard");
        }}
      >
        {"Model Card "}
        <span>
          <Icon name="push-right" />
        </span>
      </Button>
      {currentModal === "modelcard" && (
        <GenericModal
          size="lg"
          scrollable
          className={`${styles["modal"]}`}
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Model Card"
          body={
            <div>
              {isError && error.message}
              {data2?.result?.model_card === undefined ? (
                "no content available"
              ) : (
                <Markdown>{data2?.result?.model_card}</Markdown>
              )}
            </div>
          }
        />
      )}
      {currentModal === "inferenceinfo" && (
        <GenericModal
          size="lg"
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Inference Info"
          body={
            <div>
              {model.model_id}
              <InferenceServerInfo modelId={model.model_id!} />
            </div>
          }
        />
      )}
      {currentModal === "downloadmodel" && (
        <GenericModal
          size="lg"
          toggle={() => {
            setCurrentModal(undefined);
          }}
          title="Download Model"
          body={
            <div className={`${styles["download-body"]}`}>
              {downloadLinkInfo?.download_links &&
                Object.entries(downloadLinkInfo.download_links).map(
                  ([filename, url]) => {
                    return (
                      <div className={`${styles["download-links"]}`}>
                        <div>{filename}:</div>
                        <div></div>
                        <div className={`${styles["download-url-button"]}`}>
                          <Button
                            onClick={() => downloadOnClick(url, filename)}
                          >
                            {" "}
                            Download{" "}
                          </Button>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          }
        />
      )}
    </div>
  );
};

export default ModelDetailsByPlatform;
