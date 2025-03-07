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
const $header = (HEADER_INFO) => {
  const header = document.createElement("header");
  header.classList.add("gnb");
  header.innerHTML += `<h1 class="gnb__title text-title">${HEADER_INFO.title}</h1>`;
  header.innerHTML += `<button type="button" class="gnb__button" aria-label="${HEADER_INFO.buttonTitle}">
      <img src="${HEADER_INFO.buttonImage}" alt="${HEADER_INFO.buttonTitle}">
    </button>`;
  return header;
};
const $restaurantItem = (RESTAURANT_INFO) => {
  const restaurantItem = document.createElement("li");
  restaurantItem.classList.add("restaurant");
  restaurantItem.innerHTML += `<div class="restaurant__category">
            <img src="${RESTAURANT_INFO.categoryIcon}" alt="${RESTAURANT_INFO.categoryTitle}" class="category-icon">
          </div>`;
  restaurantItem.innerHTML += `<div class="restaurant__info">
            <h3 class="restaurant__name text-subtitle">${RESTAURANT_INFO.name}</h3>
            <span class="restaurant__distance text-body">${RESTAURANT_INFO.distance}</span>
            <p class="restaurant__description text-body">${RESTAURANT_INFO.description}</p>
          </div>`;
  return restaurantItem;
};
const $inputItem = (fieldType, fieldName) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("form-item");
  if (fieldType[fieldName].attribute.required)
    wrapper.classList.add("form-item--required");
  const label = document.createElement("label");
  label.htmlFor = `${fieldType[fieldName].attribute.id} text-caption`;
  label.innerText = fieldType[fieldName].label;
  wrapper.appendChild(label);
  wrapper.appendChild(fieldType.create(fieldType[fieldName]));
  if (fieldType[fieldName].helperText) {
    const helperText = document.createElement("span");
    helperText.classList.add("help-text", "text-caption");
    helperText.innerText = fieldType[fieldName].helperText;
    wrapper.appendChild(helperText);
  }
  return wrapper;
};
const handleAddRestaurant = (e) => {
  e.preventDefault();
  try {
    const form = document.getElementById("add-restaurant-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    validateForm(form);
    addRestaurant(data);
  } catch (error) {
    alert(error.message);
  }
};
const validateForm = (form) => {
  const requiredFields = form.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );
  requiredFields.forEach((requiredField) => {
    if (!requiredField.value.trim()) {
      const labelText = document.querySelector(
        `label[for="${requiredField.id} text-caption"]`
      ).innerText;
      throw new Error(`${labelText}(은)는 필수 값입니다.`);
    }
  });
};
const $form = (formFields) => {
  const form = document.createElement("form");
  form.id = "add-restaurant-form";
  formFields.forEach((field) => {
    form.appendChild(field);
  });
  form.addEventListener("submit", handleAddRestaurant);
  return form;
};
const CATEGORY_ICON = {
  한식: "images/category-korean.png",
  중식: "images/category-chinese.png",
  일식: "images/category-japanese.png",
  양식: "images/category-western.png",
  아시안: "images/category-asian.png",
  기타: "images/category-etc.png"
};
const addRestaurant = (data) => {
  handleModalClose();
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
const handleModalClose = () => {
  document.querySelector(".modal").classList.remove("modal--open");
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
  title.innerText = "새로운 음식점";
  container.appendChild(title);
  container.appendChild($form(form));
  wrapper.appendChild(container);
  document.addEventListener("keydown", (e) => {
    e.key === "Escape" && handleModalClose();
  });
  background.addEventListener("click", handleModalClose);
  document.querySelector(".gnb__button").addEventListener("click", handleModalOpen);
  return wrapper;
};
const $button = (BUTTON_INFO) => {
  const button = document.createElement("button");
  button.innerText = BUTTON_INFO.text;
  button.type = BUTTON_INFO.type;
  button.classList.add(...BUTTON_INFO.className);
  if (BUTTON_INFO.event) {
    button.addEventListener("click", BUTTON_INFO.event);
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
const UI_CONFIG = Object.freeze({
  HEADER: Object.freeze({
    title: "점심 뭐 먹지",
    buttonTitle: "음식점 추가",
    buttonImage: "images/add-button.png"
  }),
  BUTTONS: Object.freeze({
    CANCEL: {
      text: "취소하기",
      type: "button",
      event: handleModalClose,
      className: [
        "button",
        "button--secondary",
        "text-caption",
        "cancel-button"
      ]
    },
    ADD: {
      text: "추가하기",
      type: "submit",
      event: handleAddRestaurant,
      className: ["button", "button--primary", "text-caption", "add-button"]
    }
  })
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
const $select = (selectInfo) => {
  const select = document.createElement("select");
  Object.assign(select, selectInfo.attribute);
  Object.keys(selectInfo.options).forEach((selectName) => {
    const option = document.createElement("option");
    option.value = selectInfo.options[selectName];
    option.textContent = selectName;
    select.appendChild(option);
  });
  return select;
};
const $input = (inputInfo) => {
  const input = document.createElement("input");
  Object.assign(input, inputInfo.attribute);
  return input;
};
const $textarea = (textareaInfo) => {
  const textarea = document.createElement("textarea");
  Object.assign(textarea, textareaInfo.attribute);
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
const FORM_FIELDS = Object.freeze({
  INPUTS: Object.freeze({
    name: {
      label: "이름",
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
      attribute: {
        id: "link",
        name: "link",
        type: "text",
        maxlength: 100,
        placeholder: "https://www.woowacourse.io/"
      }
    },
    create: (info) => $input(info)
  }),
  SELECTS: Object.freeze({
    category: {
      label: "카테고리",
      options: categoryOptions,
      attribute: {
        required: true,
        id: "category",
        name: "category"
      }
    },
    distance: {
      label: "거리(도보 이동 시간)",
      options: distanceOptions,
      attribute: {
        required: true,
        id: "distance",
        name: "distance"
      }
    },
    create: (info) => $select(info)
  }),
  TEXTAREAS: Object.freeze({
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
  })
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
