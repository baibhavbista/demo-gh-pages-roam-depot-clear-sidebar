import { render as renderSimpleAlert } from "roamjs-components/components/SimpleAlert";
import HotKeyPanel from "./HotKeyPanel";

// define a handler
let myEventHandler = undefined;

async function removeWindow(w) {
  window.roamAlphaAPI.ui.rightSidebar.removeWindow(
    {
      "window":
      {
        "type": w['type'],
        "block-uid": w['block-uid'] || w['page-uid'] || w['mentions-uid']
      }
    }
  )
}

async function toggleWindowCollapse() {
  let windows = window.roamAlphaAPI.ui.rightSidebar.getWindows();
  const allCollapsed = windows.every(item => item["collapsed?"] === true);
  windows.forEach(w => {
    if (allCollapsed) {
      window.roamAlphaAPI.ui.rightSidebar.expandWindow(
        {
            "window":
            {
              "type": w['type'],
              "block-uid": w['block-uid'] || w['page-uid'] || w['mentions-uid']
            }
          }
    )
    } else{
      window.roamAlphaAPI.ui.rightSidebar.collapseWindow(
          {
              "window":
              {
                "type": w['type'],
                "block-uid": w['block-uid'] || w['page-uid'] || w['mentions-uid']
              }
            }
      )
    }
  })
}

async function loopWindows(extensionAPI) {
  let sidebar = window.roamAlphaAPI.ui.rightSidebar.getWindows();
  if (extensionAPI.settings.get('sidebar-confirm')) {
    renderSimpleAlert({
      content:
        `Do you want to clear ${sidebar.length} blocks from the sidebar?`,
      onConfirm: () => {
        for (let i = 0; i < sidebar.length; i++) {
          // console.log(sidebar[i])
          removeWindow(sidebar[i])
        }
      },
      onCancel: () => {
        // do nothing
      },
    });
  } else {
    for (let i = 0; i < sidebar.length; i++) {
      removeWindow(sidebar[i])
    }
  }
}

const createIconButton = (icon, className) => {
  const popoverButton = document.createElement("button");
  popoverButton.className = `bp3-button bp3-minimal bp3-small ${className}`;
  popoverButton.tabIndex = 0;
  popoverButton.style = "right: 85px;";
  const popoverIcon = document.createElement("span");
  popoverIcon.className = `bp3-icon bp3-icon-${icon}`;

  popoverButton.appendChild(popoverIcon);

  return popoverButton;
};

function createButton(extensionAPI) {


  var iconName = 'delete'
  var nameToUse = 'clearSidebar';

  var checkForButton = document.getElementById(`${nameToUse}-flex-space`);
  if (!checkForButton) {
    var mainButton = createIconButton(iconName, 'clear-sidebar');
    var roamSidebarButton = document.body.querySelector("#right-sidebar>.flex-h-box>button");

    var flexDiv = document.createElement("div");
    flexDiv.className = "clear-sidebar";
    flexDiv.id = nameToUse + "-flex-space";

    roamSidebarButton.insertAdjacentElement("beforeBegin", mainButton);
    roamSidebarButton.insertAdjacentElement("beforeBegin", flexDiv);

    mainButton.addEventListener("click", function () { loopWindows(extensionAPI) });

  }

}

function createCollapseButton(){
  var iconName = 'collapse-all'
  var nameToUse = 'collapseAll';

  var checkForButton = document.getElementById(`${nameToUse}-flex-space`);
  if (!checkForButton) {
    var mainButton = createIconButton(iconName, 'collapse-all');
    var roamSidebarButton = document.body.querySelector("#right-sidebar>.flex-h-box>button");

    var flexDiv = document.createElement("div");
    flexDiv.className = "collapse-all";
    flexDiv.id = nameToUse + "-flex-space";

    roamSidebarButton.insertAdjacentElement("beforeBegin", mainButton);
    roamSidebarButton.insertAdjacentElement("beforeBegin", flexDiv);
    mainButton.addEventListener("click", function () { toggleWindowCollapse() });

  }
}

// bp3-icon-collapse-all
function destroyButton(name) {
  // remove all parts of the button
  const toggles = document.querySelectorAll(name);
  // console.log(toggles)
  toggles.forEach(tog => {
    tog.remove();
  });
}


async function onload({ extensionAPI }) {
  if (!extensionAPI.settings.get('sidebar-confirm')) {
    await extensionAPI.settings.set('sidebar-confirm', false);
  }
  if (!extensionAPI.settings.get('sidebar-collapse')) {
    await extensionAPI.settings.set('sidebar-collapse', false);
  } else{
    createCollapseButton()
  }
  
  const panelConfig = {
    tabTitle: "Clear Sidebar",
    settings: [
      {
        id: "sidebar-confirm",
        name: "Confirm Dialog",
        description: "Will show a confirm dialog before the sidebar is cleared",
        action: {
          type: "switch",
          onChange: (evt) => { }
        }
      },
      {
        id: "sidebar-collapse",
        name: "Collapse Blocks",
        description: "Adds a button to the sidebar to collapse all open blocks",
        action: {
          type: "switch",
          onChange: (evt) => { 
            if (evt['target']['checked']) {
              createCollapseButton()
          } else{
            destroyButton('.collapse-all')
          }
          }
        }
      },
      {
        id: "hot-keys",
        name: "Hot Keys",
        description:
          "Set a custom hot key to clear the sidebar",
        action: {
          type: "reactComponent",
          component: HotKeyPanel(extensionAPI),
        },
      },
    ]
  };

  extensionAPI.settings.panel.create(panelConfig);
  
  
  myEventHandler = async (e) => {
    //figure out what keys are being pressed and save them
    const modifiers = new Set();
    if (e.altKey) modifiers.add("alt");
    if (e.shiftKey) modifiers.add("shift");
    if (e.ctrlKey) modifiers.add("control");
    if (e.metaKey) modifiers.add("meta");
    if (modifiers.size) {
      const mapping = Array.from(modifiers)
        .sort()
        .concat(e.key.toLowerCase())
        .join("+");

        // if the current modifier list being pressed in the event exists in the hotkeys list get the uid
      const srcUid = (
        extensionAPI.settings.get("hot-keys")
      )?.[mapping];

      if (srcUid) { //if there's a match
        e.preventDefault(); //stop the normal shortcut action
        e.stopPropagation(); //stop the event from continuing
        loopWindows(extensionAPI)
        // console.log("correct keyboard shortcuts hit")
        
      }
    }
  }
  // attaching to the window allows for listens outside of a block
  window?.addEventListener("keydown", myEventHandler);
  
  createButton(extensionAPI)
  console.log("load clear sidebar plugin")
}

function onunload() {
  window.removeEventListener("keydown", myEventHandler, false);
  destroyButton('.clear-sidebar')
  destroyButton('.collapse-all')
  console.log("unload clear sidebar plugin");
}

export default {
  onload,
  onunload
};
