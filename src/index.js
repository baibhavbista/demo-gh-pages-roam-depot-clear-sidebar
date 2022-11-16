import { render as renderSimpleAlert } from "roamjs-components/components/SimpleAlert";
import HotKeyPanel from "./HotKeyPanel";

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

function createButton(extensionAPI) {

  const createIconButton = (icon) => {
    const popoverButton = document.createElement("button");
    popoverButton.className = "bp3-button bp3-minimal bp3-small clear-sidebar";
    popoverButton.tabIndex = 0;
    popoverButton.style = "right: 85px;";
    const popoverIcon = document.createElement("span");
    popoverIcon.className = `bp3-icon bp3-icon-${icon}`;

    popoverButton.appendChild(popoverIcon);

    return popoverButton;
  };
  var iconName = 'delete'
  var nameToUse = 'clearSidebar';

  var checkForButton = document.getElementById(`${nameToUse}-flex-space`);
  if (!checkForButton) {
    var mainButton = createIconButton(iconName);
    var roamSidebarButton = document.body.querySelector("#right-sidebar>.flex-h-box>button");

    var flexDiv = document.createElement("div");
    flexDiv.className = "clear-sidebar";
    flexDiv.id = nameToUse + "-flex-space";

    roamSidebarButton.insertAdjacentElement("beforeBegin", mainButton);
    roamSidebarButton.insertAdjacentElement("beforeBegin", flexDiv);

    mainButton.addEventListener("click", function () { loopWindows(extensionAPI) });

  }

}

function destroyButton() {
  // remove all parts of the button
  const toggles = document.querySelectorAll('.clear-sidebar');
  // console.log(toggles)
  toggles.forEach(tog => {
    tog.remove();
  });
}


async function onload({ extensionAPI }) {
  if (!extensionAPI.settings.get('sidebar-confirm')) {
    await extensionAPI.settings.set('sidebar-confirm', false);
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
  createButton(extensionAPI)
  console.log("load clear sidebar plugin")
}

function onunload() {
  destroyButton()
  console.log("unload clear sidebar plugin")
}

export default {
  onload,
  onunload
};
