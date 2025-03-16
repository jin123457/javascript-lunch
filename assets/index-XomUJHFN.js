(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const $button = (buttonInfo, buttonEvent = {}) => {
  const { attribute, text } = buttonInfo;
  const { eventType, eventHandler } = buttonEvent;
  const button = document.createElement("button");
  Object.assign(button, attribute);
  button.textContent = text;
  if (eventType && eventHandler) {
    button.addEventListener(eventType, eventHandler);
  }
  return button;
};
const $buttonContainer = (buttons) => {
  const container = document.createElement("div");
  container.classList.add("button-container");
  buttons.forEach((button) => {
    container.appendChild(button);
  });
  return container;
};
const $inputItemLabel = ({ attribute, label }) => {
  const itemLabel = document.createElement("label");
  itemLabel.classList.add("text-caption");
  itemLabel.htmlFor = attribute.id;
  itemLabel.textContent = label;
  return itemLabel;
};
const $inputItemHelperText = ({ helperText }) => {
  const itemHelperText = document.createElement("span");
  itemHelperText.classList.add("help-text", "text-caption");
  itemHelperText.textContent = helperText;
  return itemHelperText;
};
const $inputItem = (fieldType, fieldName) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("form-item");
  if (fieldType[fieldName].attribute.required) {
    wrapper.classList.add("form-item--required");
  }
  wrapper.appendChild($inputItemLabel(fieldType[fieldName]));
  wrapper.appendChild(fieldType.create(fieldType[fieldName]));
  if (fieldType[fieldName].helperText) {
    wrapper.appendChild($inputItemHelperText(fieldType[fieldName]));
  }
  return wrapper;
};
const $form = (formFields, formEvent) => {
  const { eventType, eventHandler } = formEvent;
  const form = document.createElement("form");
  form.id = "add-restaurant-form";
  formFields.forEach((field) => {
    form.appendChild(field);
  });
  if (eventType && eventHandler) {
    form.addEventListener(eventType, eventHandler);
  }
  return form;
};
const deepFreeze = (object) => {
  const propNames = Object.getOwnPropertyNames(object);
  for (let name of propNames) {
    const value = object[name];
    object[name] = value && typeof value === "object" ? deepFreeze(value) : value;
  }
  return Object.freeze(object);
};
const UI_CONFIG = deepFreeze({
  HEADER: {
    title: "점심 뭐 먹지",
    buttonTitle: "음식점 추가",
    buttonImage: "images/add-button.png"
  },
  TABS: {
    ALL: {
      text: "모든 음식점",
      attribute: {
        type: "button",
        id: "all",
        className: "button button--secondary select-tab-active"
      }
    },
    FAVORITE: {
      text: "자주 가는 음식점",
      attribute: {
        type: "button",
        id: "favorite",
        className: "button button--secondary"
      }
    }
  },
  BUTTONS: {
    CANCEL: {
      text: "취소하기",
      attribute: {
        type: "button",
        className: "button button--secondary text-caption cancel-button"
      }
    },
    ADD: {
      text: "추가하기",
      attribute: {
        id: "addRestaurantButton",
        type: "submit",
        disabled: true,
        className: "button button--primary text-caption add-button button--disabled"
      }
    },
    DELETE: {
      text: "삭제하기",
      eventType: "click",
      event: null,
      attribute: {
        id: "deleteRestaurantButton",
        type: "button",
        className: "button button--secondary text-caption cancel-button"
      }
    },
    CLOSE: {
      text: "닫기",
      attribute: {
        id: "closeModalButton",
        type: "button",
        className: "button button--primary text-caption add-button"
      }
    }
  }
});
const handleModalClose = () => {
  document.querySelector(".modal").classList.remove("modal--open");
};
const handleModalCloseEsc = (e) => {
  if (e.key === "Escape") {
    handleModalClose();
  }
};
const handleModalOpen = () => {
  document.querySelector(".modal").classList.add("modal--open");
};
const $modal = (type, id = "") => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("modal");
  const background = document.createElement("div");
  background.classList.add("modal-backdrop");
  wrapper.appendChild(background);
  const container = document.createElement("div");
  container.classList.add("modal-container");
  wrapper.appendChild(container);
  document.addEventListener("keydown", handleModalCloseEsc);
  background.addEventListener("click", handleModalClose);
  return wrapper;
};
const storageHandler = {
  getItem: (data) => JSON.parse(localStorage.getItem(data) ?? "[]") || [],
  setItem: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  deleteItem: (key, value) => {
    const newData = storageHandler.getItem(key).filter((item) => item.id !== value);
    storageHandler.setItem(key, newData);
  },
  filterItem: (key, category, sort, id = "") => {
    let restaurantData;
    if (id === "all") {
      restaurantData = storageHandler.getItem(key);
    } else if (id === "favorite") {
      restaurantData = storageHandler.getItem(key).filter((item) => item.isFavorite === true);
    }
    if (!category && !sort) {
      return restaurantData.reverse().sort((a, b) => a[sort] - b[sort]);
    }
    if (!category && sort === "distance") {
      return restaurantData.sort((a, b) => a[sort] - b[sort]);
    }
    if (!category) {
      return restaurantData.sort(
        (a, b) => a[sort].toLowerCase() < b[sort].toLowerCase() ? -1 : 1
      );
    }
    const categoryData = restaurantData.filter(
      (item) => item.categoryTitle === category
    );
    if (!sort) {
      return categoryData.reverse().sort((a, b) => a[sort] - b[sort]);
    }
    if (sort === "distance") {
      return categoryData.sort((a, b) => a[sort] - b[sort]);
    }
    return categoryData.sort(
      (a, b) => a[sort].toLowerCase() < b[sort].toLowerCase() ? -1 : 1
    );
  },
  updateFavorite: (key, restaurantInfo) => {
    const favoriteData = storageHandler.getItem(key).filter((item) => item.id === restaurantInfo.id);
    const updateData = storageHandler.getItem(key).map((item) => {
      if (item.id === restaurantInfo.id) {
        restaurantInfo.isFavorite = !favoriteData[0].isFavorite;
        return restaurantInfo;
      }
      return item;
    });
    storageHandler.setItem(key, updateData);
    return favoriteData.length > 0 ? favoriteData[0].isFavorite : null;
  }
};
const STORAGE_KEY_NAME = "restaurantItems";
const updateFavoriteIcon = (restaurantInfo, e) => {
  e.stopPropagation();
  const favoriteState = storageHandler.updateFavorite(
    STORAGE_KEY_NAME,
    restaurantInfo
  );
  const favoriteIcon = e.currentTarget.children[0];
  const isModalFavoriteIcon = e.currentTarget.parentNode.classList.contains("modal-container");
  document.querySelector(
    `.modal-container > .favorite-icon > path:first-of-type`
  );
  if (favoriteState) {
    if (isModalFavoriteIcon) {
      const listFavoriteIcon = document.querySelector(
        `[data-id="${restaurantInfo.id}"] > .favorite-icon > path:first-of-type`
      );
      listFavoriteIcon.setAttribute("fill", "none");
    }
    return favoriteIcon.setAttribute("fill", "none");
  }
  if (isModalFavoriteIcon) {
    const listFavoriteIcon = document.querySelector(
      `[data-id="${restaurantInfo.id}"] > .favorite-icon > path:first-of-type`
    );
    listFavoriteIcon.setAttribute("fill", "#EC4A0A");
  }
  favoriteIcon.setAttribute("fill", "#EC4A0A");
};
const $favoriteIcon = (isFavorite) => {
  const favoriteIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  favoriteIcon.classList.add("favorite-icon");
  favoriteIcon.tabindex = 0;
  favoriteIcon.role = "button";
  favoriteIcon.setAttribute("fill", "#EC4A0A");
  const favoriteIconStroke = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  favoriteIconStroke.setAttribute(
    "d",
    `M14 21.0267L22.24 26L20.0534 16.6267L27.3334 10.32L17.7467 9.50666L14 0.666656L10.2534 9.50666L0.666687 10.32L7.94669 16.6267L5.76002 26L14 21.0267Z`
  );
  favoriteIconStroke.setAttribute("fill", `${isFavorite ? "#EC4A0A" : "none"}`);
  const favoriteIconPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  favoriteIconPath.setAttribute(
    "d",
    `M27.3334 10.32L17.7467 9.49332L14 0.666656L10.2534 9.50666L0.666687 10.32L7.94669 16.6267L5.76002 26L14 21.0267L22.24 26L20.0667 16.6267L27.3334 10.32ZM14 18.5333L8.98669 21.56L10.32 15.8533L5.89335 12.0133L11.7334 11.5067L14 6.13332L16.28 11.52L22.12 12.0267L17.6934 15.8667L19.0267 21.5733L14 18.5333Z`
  );
  favoriteIconPath.setAttribute("stroke", "#EC4A0A");
  favoriteIconPath.setAttribute("stroke-opacity", "0.5");
  favoriteIconPath.setAttribute("stroke-width", "1");
  favoriteIcon.appendChild(favoriteIconStroke);
  favoriteIcon.appendChild(favoriteIconPath);
  return favoriteIcon;
};
const ERROR = deepFreeze({
  INVALID_REQUIRED: "(은)는 필수 값입니다.",
  INVALID_URL: "유효한 URL이 아닙니다."
});
const USER_MESSAGE = deepFreeze({
  CONFIRM_DELETE: "정말로 삭제하시겠습니까? \n삭제하실 경우 다시 복구가 어렵습니다."
});
const $createRestaurantInfo = (restaurantInfo) => {
  const {
    categoryIcon,
    categoryTitle,
    description,
    distance,
    link,
    name,
    id,
    isFavorite
  } = restaurantInfo;
  const container = document.querySelector(".modal-container");
  container.replaceChildren();
  const category = document.createElement("div");
  category.classList.add("restaurant__category");
  const categoryImage = document.createElement("img");
  categoryImage.src = categoryIcon;
  categoryImage.alt = categoryTitle;
  categoryImage.classList.add("category-icon");
  category.appendChild(categoryImage);
  const InfoName = document.createElement("h3");
  InfoName.classList.add("restaurant__name", "text-subtitle");
  InfoName.textContent = name;
  const InfoDistance = document.createElement("span");
  InfoDistance.classList.add("restaurant__distance", "text-body");
  InfoDistance.textContent = `캠퍼스부터 ${distance}분 내`;
  const InfoDescription = document.createElement("p");
  InfoDescription.classList.add("restaurant__description", "text-body");
  InfoDescription.textContent = description;
  container.appendChild(category);
  container.appendChild(InfoName);
  container.appendChild(InfoDistance);
  container.appendChild(InfoDescription);
  container.appendChild(InfoDescription);
  if (link) {
    const InfoLink = document.createElement("a");
    InfoLink.href = link;
    InfoLink.target = "_blank";
    InfoLink.rel = "noopener noreferrer";
    InfoLink.textContent = link;
    container.appendChild(InfoLink);
  }
  const favoriteIcon = $favoriteIcon(isFavorite);
  favoriteIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    updateFavoriteIcon(restaurantInfo, e);
  });
  container.appendChild(favoriteIcon);
  const itemDelete = () => {
    if (confirm(USER_MESSAGE.CONFIRM_DELETE)) {
      document.querySelector(`[data-id="${id}"]`).remove();
      storageHandler.deleteItem(STORAGE_KEY_NAME, id);
    }
    handleModalClose();
  };
  const deleteEvent = {
    eventType: "click",
    eventHandler: itemDelete
  };
  const closeEvent = { eventType: "click", eventHandler: handleModalClose };
  const deleteCloseButtons = $buttonContainer([
    $button(UI_CONFIG.BUTTONS.DELETE, deleteEvent),
    $button(UI_CONFIG.BUTTONS.CLOSE, closeEvent)
  ]);
  container.appendChild(deleteCloseButtons);
  handleModalOpen();
};
const $restaurantCategory = ({ categoryIcon, categoryTitle }) => {
  const category = document.createElement("div");
  category.classList.add("restaurant__category");
  const categoryImage = document.createElement("img");
  categoryImage.src = categoryIcon;
  categoryImage.alt = categoryTitle;
  categoryImage.classList.add("category-icon");
  category.appendChild(categoryImage);
  return category;
};
const $restaurantInfo = ({ name, distance, description }) => {
  const info = document.createElement("div");
  info.classList.add("restaurant__info");
  const InfoName = document.createElement("h3");
  InfoName.classList.add("restaurant__name", "text-subtitle");
  InfoName.textContent = name;
  info.appendChild(InfoName);
  const InfoDistance = document.createElement("span");
  InfoDistance.classList.add("restaurant__distance", "text-body");
  InfoDistance.textContent = `캠퍼스부터 ${distance}분 내`;
  info.appendChild(InfoDistance);
  const InfoDescription = document.createElement("p");
  InfoDescription.classList.add("restaurant__description", "text-body");
  InfoDescription.textContent = description;
  info.appendChild(InfoDescription);
  return info;
};
const $restaurantItem = (restaurantInfo) => {
  const restaurantItem = document.createElement("li");
  restaurantItem.classList.add("restaurant");
  restaurantItem.dataset.id = restaurantInfo.id;
  restaurantItem.appendChild($restaurantCategory(restaurantInfo));
  restaurantItem.appendChild($restaurantInfo(restaurantInfo));
  restaurantItem.addEventListener(
    "click",
    () => $createRestaurantInfo(restaurantInfo)
  );
  const favoriteIcon = $favoriteIcon(restaurantInfo.isFavorite);
  favoriteIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    updateFavoriteIcon(restaurantInfo, e);
  });
  restaurantItem.appendChild(favoriteIcon);
  return restaurantItem;
};
const $select = ({ attribute, options, eventType, event }) => {
  const select = document.createElement("select");
  Object.assign(select, attribute);
  Object.keys(options).forEach((selectName) => {
    const option = document.createElement("option");
    option.value = options[selectName];
    option.textContent = selectName;
    select.appendChild(option);
  });
  if (eventType && event) {
    select.addEventListener(eventType, event);
  }
  return select;
};
const $input = ({ attribute, eventType, event }) => {
  const input = document.createElement("input");
  Object.assign(input, attribute);
  if (eventType && event) {
    input.addEventListener(eventType, event);
  }
  return input;
};
const $textarea = ({ attribute }) => {
  const textarea = document.createElement("textarea");
  Object.assign(textarea, attribute);
  return textarea;
};
const $restaurantList = (restaurantItems) => {
  if (restaurantItems.length > 0) {
    const restaurantList = document.createElement("ul");
    restaurantList.classList.add("restaurant-list");
    restaurantItems.forEach((item) => {
      restaurantList.appendChild($restaurantItem(item));
    });
    return restaurantList;
  }
  const noRestaurant = document.createElement("div");
  noRestaurant.classList.add("no-restaurant");
  const noRestaurantIcon = document.createElement("i");
  noRestaurantIcon.textContent = "🍽️";
  const noRestaurantText = document.createElement("b");
  noRestaurantText.textContent = "등록된 음식점이 없습니다.";
  noRestaurant.appendChild(noRestaurantIcon);
  noRestaurant.appendChild(noRestaurantText);
  return noRestaurant;
};
const $createRestaurantList = () => {
  const restaurantContainer = document.querySelector(
    ".restaurant-list-container"
  );
  restaurantContainer.replaceChildren();
  const categoryFilter = document.getElementById("category-filter").value || null;
  const sortFilter = document.getElementById("sorting-filter").value;
  const restaurantItems = storageHandler.filterItem(
    STORAGE_KEY_NAME,
    categoryFilter,
    sortFilter,
    document.querySelector(".select-tab-active").id
  );
  restaurantContainer.appendChild($restaurantList(restaurantItems));
};
const categoryOptions = {
  "선택해 주세요": "",
  한식: "한식",
  중식: "중식",
  일식: "일식",
  양식: "양식",
  아시안: "아시안",
  기타: "기타"
};
const distanceOptions = {
  "선택해 주세요": "",
  "5분 이내": 5,
  "10분 이내": 10,
  "15분 이내": 15,
  "20분 이내": 20,
  "30분 이내": 30
};
const categoryFilterOptions = {
  전체: "",
  한식: "한식",
  중식: "중식",
  일식: "일식",
  양식: "양식",
  아시안: "아시안",
  기타: "기타"
};
const sortingFilterOptions = {
  최신순: "",
  이름순: "name",
  거리순: "distance"
};
const isValidUrl = (url) => {
  const pattern = new RegExp(
    "^([a-zA-Z]+:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return pattern.test(url);
};
const validateRestaurantForm = (form) => {
  if (!form.category.value) {
    const categoryLabelText = document.querySelector(
      `label[for="category"]`
    ).textContent;
    throw new Error(`${categoryLabelText}${ERROR.INVALID_REQUIRED}`);
  }
  if (!form.name.value.trim()) {
    const nameLabelText = document.querySelector(`label[for="name"]`).textContent;
    throw new Error(`${nameLabelText}${ERROR.INVALID_REQUIRED}`);
  }
  if (!form.distance.value) {
    const distanceLabelText = document.querySelector(
      `label[for="distance"]`
    ).textContent;
    throw new Error(`${distanceLabelText}${ERROR.INVALID_REQUIRED}`);
  }
  if (form.link.value && !isValidUrl(form.link.value)) {
    document.querySelector(`label[for="link"]`).textContent;
    throw new Error(ERROR.INVALID_URL);
  }
};
const senseChangeRestaurantFormValue = () => {
  try {
    const form = document.getElementById("add-restaurant-form");
    validateRestaurantForm(form);
    const submitButton = document.getElementById("addRestaurantButton");
    submitButton.classList.remove("button--disabled");
    submitButton.disabled = false;
  } catch (error) {
    const submitButton = document.getElementById("addRestaurantButton");
    submitButton.classList.add("button--disabled");
    submitButton.disabled = true;
  }
};
const FORM_FIELDS = deepFreeze({
  INPUTS: {
    name: {
      label: "이름",
      eventType: "input",
      event: senseChangeRestaurantFormValue,
      attribute: {
        required: true,
        id: "name",
        name: "name",
        type: "text",
        maxlength: 30,
        placeholder: "음식점 이름을 입력해주세요."
      }
    },
    link: {
      label: "참고 링크",
      eventType: "input",
      event: senseChangeRestaurantFormValue,
      attribute: {
        id: "link",
        name: "link",
        type: "text",
        maxlength: 100,
        placeholder: "https://www.woowacourse.io/"
      }
    },
    create: (info) => $input(info)
  },
  SELECTS: {
    category: {
      label: "카테고리",
      options: categoryOptions,
      eventType: "change",
      event: senseChangeRestaurantFormValue,
      attribute: {
        required: true,
        id: "category",
        name: "category"
      }
    },
    distance: {
      label: "거리(도보 이동 시간)",
      options: distanceOptions,
      eventType: "change",
      event: senseChangeRestaurantFormValue,
      attribute: {
        required: true,
        id: "distance",
        name: "distance"
      }
    },
    categoryFilter: {
      options: categoryFilterOptions,
      eventType: "change",
      event: $createRestaurantList,
      attribute: {
        id: "category-filter",
        name: "restaurant-filter"
      }
    },
    sortingFilter: {
      options: sortingFilterOptions,
      eventType: "change",
      event: $createRestaurantList,
      attribute: {
        id: "sorting-filter",
        name: "restaurant-filter"
      }
    },
    create: (info) => $select(info)
  },
  TEXTAREAS: {
    description: {
      label: "설명",
      helperText: "메뉴 등 추가 정보를 입력해 주세요.",
      attribute: {
        id: "description",
        name: "description",
        cols: "30",
        rows: "5",
        maxlength: 200,
        placeholder: "너무 맛있는데 너무 매워서 배가 아파요,,,"
      }
    },
    create: (info) => $textarea(info)
  }
});
const CATEGORY_ICON = deepFreeze({
  한식: "images/category-korean.png",
  중식: "images/category-chinese.png",
  일식: "images/category-japanese.png",
  양식: "images/category-western.png",
  아시안: "images/category-asian.png",
  기타: "images/category-etc.png"
});
const restaurantFormReset = () => {
  handleModalClose();
  const form = document.getElementById("add-restaurant-form");
  form.reset();
};
const addRestaurant = (data) => {
  const newRestaurant = {
    categoryIcon: CATEGORY_ICON[data.category],
    categoryTitle: data.category,
    name: data.name,
    distance: data.distance,
    description: data.description,
    link: data.link,
    id: /* @__PURE__ */ new Date(),
    isFavorite: false
  };
  document.querySelector(".restaurant-list").prepend($restaurantItem(newRestaurant));
  const currentItem = storageHandler.getItem(STORAGE_KEY_NAME);
  storageHandler.setItem(STORAGE_KEY_NAME, [...currentItem, newRestaurant]);
  const noRestaurant = document.getElementById("noRestaurant");
  if (noRestaurant) noRestaurant.remove();
};
const handleAddRestaurant = (e) => {
  e.preventDefault();
  try {
    const form = document.getElementById("add-restaurant-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    validateRestaurantForm(form);
    addRestaurant(data);
    restaurantFormReset(form);
  } catch (error) {
    alert(error.message);
    console.log(error);
  }
};
const $createRestaurantForm = () => {
  const container = document.querySelector(".modal-container");
  container.replaceChildren();
  const cancelEvent = { eventType: "click", eventHandler: restaurantFormReset };
  const submitCancelButtons = $buttonContainer([
    $button(UI_CONFIG.BUTTONS.CANCEL, cancelEvent),
    $button(UI_CONFIG.BUTTONS.ADD)
  ]);
  const restaurantAddForm = [
    $inputItem(FORM_FIELDS.SELECTS, "category"),
    $inputItem(FORM_FIELDS.INPUTS, "name"),
    $inputItem(FORM_FIELDS.SELECTS, "distance"),
    $inputItem(FORM_FIELDS.TEXTAREAS, "description"),
    $inputItem(FORM_FIELDS.INPUTS, "link"),
    submitCancelButtons
  ];
  const title = document.createElement("h2");
  title.classList.add("modal-title", "text-title");
  title.textContent = "새로운 음식점";
  container.appendChild(title);
  const submitForm = { eventType: "submit", eventHandler: handleAddRestaurant };
  container.appendChild($form(restaurantAddForm, submitForm));
  handleModalOpen();
};
const $headerTitle = ({ title }) => {
  const headerTitle = document.createElement("h1");
  headerTitle.classList.add("gnb__title", "text-title");
  headerTitle.textContent = title;
  return headerTitle;
};
const $headerModalButton = ({ buttonImage, buttonTitle }) => {
  const modalButton = document.createElement("button");
  modalButton.type = "button";
  modalButton.classList.add("gnb__button");
  modalButton.ariaLabel = buttonTitle;
  modalButton.addEventListener("click", $createRestaurantForm);
  const modalButtonImage = document.createElement("img");
  modalButtonImage.src = buttonImage;
  modalButtonImage.alt = buttonTitle;
  modalButton.appendChild(modalButtonImage);
  return modalButton;
};
const $header = (headerInfo) => {
  const header = document.createElement("header");
  header.classList.add("gnb");
  header.appendChild($headerTitle(headerInfo));
  header.appendChild($headerModalButton(headerInfo));
  return header;
};
const $filterContainer = (filters) => {
  const container = document.createElement("section");
  container.classList.add("restaurant-filter-container");
  filters.forEach((filter) => {
    container.appendChild(filter);
  });
  return container;
};
const activeTabEvent = (id) => {
  const currentActiveTab = document.querySelector(".select-tab-active");
  currentActiveTab.classList.remove("select-tab-active");
  const currentClickTab = document.getElementById(id);
  currentClickTab.classList.add("select-tab-active");
};
const toggleTabClick = (e) => {
  activeTabEvent(e.target.id);
  $createRestaurantList();
};
const $tabContainer = (tabs) => {
  const container = document.createElement("nav");
  container.classList.add("tab-container");
  container.addEventListener("click", toggleTabClick);
  tabs.forEach((tab) => {
    container.appendChild(tab);
  });
  return container;
};
const $tab = (tabInfo, tabEvent = {}) => {
  const { attribute, text } = tabInfo;
  const { eventType, eventHandler } = tabEvent;
  const tab = document.createElement("button");
  Object.assign(tab, attribute);
  tab.textContent = text;
  if (eventType && eventHandler) {
    tab.addEventListener(eventType, eventHandler);
  }
  return tab;
};
addEventListener("load", () => {
  document.body.prepend($header(UI_CONFIG.HEADER));
  const navigationTabs = $tabContainer([
    $tab(UI_CONFIG.TABS.ALL),
    $tab(UI_CONFIG.TABS.FAVORITE)
  ]);
  const filterSelects = [
    FORM_FIELDS.SELECTS.create(FORM_FIELDS.SELECTS.categoryFilter),
    FORM_FIELDS.SELECTS.create(FORM_FIELDS.SELECTS.sortingFilter)
  ];
  document.querySelector("main").prepend($filterContainer(filterSelects));
  document.querySelector("main").prepend(navigationTabs);
  document.querySelector("main").appendChild($modal());
  $createRestaurantList();
});
