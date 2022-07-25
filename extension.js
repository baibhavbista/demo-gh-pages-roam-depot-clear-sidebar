/* Original code by matt vogel */
  /* v1  */

async function removeWindow(w){
    window.roamAlphaAPI.ui.rightSidebar.removeWindow(
        {"window": 
            {"type": w['type'], 
              "block-uid": w['block-uid'] || w['page-uid'] || w['mentions-uid']}
        }
      )
}

async function loopWindows(){
    let sidebar = window.roamAlphaAPI.ui.rightSidebar.getWindows();

    for (let i = 0; i < sidebar.length; i++) {
        // console.log(sidebar[i])
        await removeWindow(sidebar[i])
    }
}

function createButton() {  
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
        mainButton.addEventListener("click", loopWindows);
    }

}

function destroyButton(){

    // remove all parts of the button
    const toggles = document.querySelectorAll('.clear-sidebar');
    // console.log(toggles)
    toggles.forEach(tog => {
        tog.remove();
    });
}


export default {
  onload: () => {
    console.log("load clear sidebar plugin")
    createButton()
  },
  onunload: () => {
    console.log("unload clear sidebar plugin")
    destroyButton()
  }
};