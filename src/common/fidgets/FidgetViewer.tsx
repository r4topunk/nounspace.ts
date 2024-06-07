"use client"
import React, { useState } from "react";
import { reduce } from "lodash";
import { FidgetWrapper, FidgetWrapperProps } from "@/common/fidgets/FidgetWrapper";
import { FidgetConfig, FidgetModule, FidgetSettings } from ".";


export default function FidgetViewer({ fidgetModule }: { fidgetModule: FidgetModule }) {
  const defaultConfig: FidgetWrapperProps["config"] = {
    editConfig: fidgetModule.editConfig,
    instanceConfig: {
      editable: true,
      settings: reduce(
        fidgetModule.editConfig.fields,
        (acc, f) => ({
          ...acc,
          [f.fieldName]: f.default || null,
        }),
        {},
      )
    },
    id: fidgetModule.fidget.name,
  };
  const [config, setConfig] = useState<FidgetWrapperProps["config"]>(defaultConfig);  
  const saveConifg = async (conf: FidgetConfig<FidgetSettings>) => {
    setConfig({
      id: defaultConfig.id,
      editConfig: config.editConfig,
      instanceConfig: conf,
    });
    return true;
  };

  return (
    <FidgetWrapper
      config={config}
      saveConfig={saveConifg}
      fidget={fidgetModule.fidget}
    />
  );
}