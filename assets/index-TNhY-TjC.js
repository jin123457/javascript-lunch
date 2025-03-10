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
  InfoDistance.textContent = distance;
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
  restaurantItem.appendChild($restaurantCategory(restaurantInfo));
  restaurantItem.appendChild($restaurantInfo(restaurantInfo));
  return restaurantItem;
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
const $form = (formFields, { eventType, eventHandler }) => {
  const form = document.createElement("form");
  form.id = "add-restaurant-form";
  formFields.forEach((field) => {
    form.appendChild(field);
  });
  form.addEventListener(eventType, eventHandler);
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
const CATEGORY_ICON = deepFreeze({
  한식: "images/category-korean.png",
  중식: "images/category-chinese.png",
  일식: "images/category-japanese.png",
  양식: "images/category-western.png",
  아시안: "images/category-asian.png",
  기타: "images/category-etc.png"
});
const ERROR = deepFreeze({
  INVALID_REQUIRED: "(은)는 필수 값입니다.",
  INVALID_URL: "유효한 URL이 아닙니다."
});
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
  if (!form.name.value) {
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
const restaurantFormReset = () => {
  handleModalClose();
  const form = document.getElementById("add-restaurant-form");
  form.reset();
};
const addRestaurant = (data) => {
  const categoryIcon = CATEGORY_ICON[data.category];
  const newRestaurant = {
    categoryIcon,
    categoryTitle: data.category,
    name: data.name,
    distance: `캠퍼스부터 ${data.distance}분 내`,
    description: data.description
  };
  document.querySelector(".restaurant-list").appendChild($restaurantItem(newRestaurant));
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
  }
};
const FORM_EVENT = {
  addRestaurant: {
    eventType: "submit",
    eventHandler: handleAddRestaurant
  }
};
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
const $modal = (form) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("modal");
  const background = document.createElement("div");
  background.classList.add("modal-backdrop");
  wrapper.appendChild(background);
  const container = document.createElement("div");
  container.classList.add("modal-container");
  const title = document.createElement("h2");
  title.classList.add("modal-title", "text-title");
  title.textContent = "새로운 음식점";
  container.appendChild(title);
  container.appendChild($form(form, FORM_EVENT.addRestaurant));
  wrapper.appendChild(container);
  document.addEventListener("keydown", handleModalCloseEsc);
  background.addEventListener("click", handleModalClose);
  document.querySelector(".gnb__button").addEventListener("click", handleModalOpen);
  return wrapper;
};
const $button = ({ attribute, text, eventType, event }) => {
  const button = document.createElement("button");
  Object.assign(button, attribute);
  button.textContent = text;
  if (eventType && event) {
    button.addEventListener(eventType, event);
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
const UI_CONFIG = deepFreeze({
  HEADER: {
    title: "점심 뭐 먹지",
    buttonTitle: "음식점 추가",
    buttonImage: "images/add-button.png"
  },
  BUTTONS: {
    CANCEL: {
      text: "취소하기",
      eventType: "click",
      event: restaurantFormReset,
      attribute: {
        type: "button",
        className: "button button--secondary text-caption cancel-button"
      }
    },
    ADD: {
      text: "추가하기",
      event: handleAddRestaurant,
      attribute: {
        id: "addRestaurantButton",
        type: "submit",
        disabled: true,
        className: "button button--primary text-caption add-button button--disabled"
      }
    }
  }
});
const restaurantData = [
  {
    categoryIcon: "images/category-korean.png",
    categoryTitle: "한식",
    name: "피양콩할마니",
    distance: "캠퍼스부터 10분 내",
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은 평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은 건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만, 할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의 역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은 만큼 덜어 먹을 수 있게 준비돼 있다."
  },
  {
    categoryIcon: "images/category-chinese.png",
    categoryTitle: "중식",
    name: "친친",
    distance: "캠퍼스부터 5분 내",
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다"
  },
  {
    categoryIcon: "images/category-japanese.png",
    categoryTitle: "일식",
    name: "잇쇼우",
    distance: "캠퍼스부터 10분 내",
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다."
  },
  {
    categoryIcon: "images/category-western.png",
    categoryTitle: "양식",
    name: "이태리키친",
    distance: "캠퍼스부터 20분 내",
    description: "늘 변화를 추구하는 이태리키친입니다."
  },
  {
    categoryIcon: "images/category-asian.png",
    categoryTitle: "아시안",
    name: "호아빈 삼성점",
    distance: "캠퍼스부터 15분 내",
    description: "푸짐한 양에 국물이 일품인 쌀국수"
  },
  {
    categoryIcon: "images/category-etc.png",
    categoryTitle: "기타",
    name: "도스타코스 선릉점",
    distance: "캠퍼스부터 5분 내",
    description: "멕시칸 캐주얼 그릴"
  }
];
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
addEventListener("load", () => {
  document.body.prepend($header(UI_CONFIG.HEADER));
  const restaurantList = document.querySelector(".restaurant-list");
  restaurantData.forEach((data) => {
    restaurantList.appendChild($restaurantItem(data));
  });
  const submitCancelButtons = $buttonContainer([
    $button(UI_CONFIG.BUTTONS.CANCEL),
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
  document.querySelector("main").appendChild($modal(restaurantAddForm));
});
