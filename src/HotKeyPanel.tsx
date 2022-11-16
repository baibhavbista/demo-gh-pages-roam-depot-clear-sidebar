import { Button, InputGroup, Intent, Label } from "@blueprintjs/core";
import React, { useMemo, useState, useRef, useEffect } from "react";
import MenuItemSelect from "roamjs-components/components/MenuItemSelect";

import type { OnloadArgs } from "roamjs-components/types/native";

const HotKeyEntry = ({
  hotkey,
  value,
  order,
  keys,
  setKeys,
  extensionAPI,
}: {
  hotkey: string;
  value: string;
  order: number;
  keys: Record<string, string>;
  setKeys: (r: Record<string, string>) => void;
  extensionAPI: OnloadArgs["extensionAPI"];
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current.className = "rm-extensions-settings";
    inputRef.current.style.minWidth = "100%";
    inputRef.current.style.maxWidth = "100%";
  }, [inputRef]);
  return (
    <div className={"flex items-center gap-1"}>
      <Label className="flex-1">
        Hot Key
        <InputGroup
          placeholder={"Type the keys themselves"}
          value={hotkey}
          onChange={() => true}
          className={"w-full"}
          inputRef={inputRef}
          onKeyDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const parts = hotkey ? hotkey.split("+") : [];
            const formatValue = (
              e.key === "Backspace"
                ? parts.slice(0, -1)
                : ["Shift", "Control", "Alt", "Meta"].includes(e.key)
                  ? Array.from(new Set(parts.concat(e.key.toLowerCase()))).sort(
                    (a, b) => b.length - a.length
                  )
                  : parts.concat(e.key.toLowerCase())
            ).join("+");
            if (formatValue === hotkey) return;
            const error = !formatValue || !!keys[formatValue];
            const newKeys = Object.fromEntries(
              Object.entries(keys).map((k, o) =>
                o !== order ? k : [formatValue, k[1]]
              )
            );
            setKeys(newKeys);
            if (!error) {
              extensionAPI.settings.set("hot-keys", newKeys);
            }
          }}
          intent={Intent.NONE}
        />
      </Label>

      <Button
        icon={"trash"}
        style={{ width: 32, height: 32 }}
        minimal
        onClick={() => {
          const newKeys = Object.fromEntries(
            Object.entries(keys).filter((_, o) => o !== order)
          );
          setKeys(newKeys);
          extensionAPI.settings.set("hot-keys", newKeys);
        }}
      />
    </div>
  );
};

const HotKeyPanel = (extensionAPI: OnloadArgs["extensionAPI"]) => () => {

  const [keys, setKeys] = useState(
    () => extensionAPI.settings.get("hot-keys") as Record<string, string> || {}
  );
  return (
    <div
      style={{
        width: "100%",
        minWidth: 256,
      }}
    >
      {Object.entries(keys).map(([key, value], order) => {
        return (
          <HotKeyEntry
            key={order}
            hotkey={key}
            value={value}
            order={order}
            extensionAPI={extensionAPI}
            keys={keys}
            setKeys={setKeys}
          />
        );
      })}
      <Button
        text={"Add Hot Key"}
        intent={Intent.PRIMARY}
        rightIcon={"plus"}
        minimal
        style={{ marginTop: 8 }}
        onClick={async () => {

          const newKeys = Object.fromEntries(
            Object.entries(keys).concat([["control+o", "xxxxxxx"]])
          );
          setKeys(newKeys);
          extensionAPI.settings.set("hot-keys", newKeys);
        }}
      />
    </div>
  );
};

export default HotKeyPanel;
