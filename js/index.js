"use strict";
//Global values and states
let monthNav = 0;
let tasks = [];
let prevMonthDays = 0;
let dayNav = null;
let eventNav = null;
const calendar = document.querySelector(".main__calendar");
const dateInput = document.querySelector("#date");
const form = document.getElementById("form");
const DATA_KEY = "data";

const displayCurrentDate = () => {
  const date = new Date();
  const currentDate = date.toISOString().split("T")[0];
  dateInput.value = currentDate;
  dayNav = currentDate;
  return date;
};

const renderCalendar = () => {
  calendar.textContent = null;
  const date = displayCurrentDate();
  if (monthNav !== 0) {
    date.setMonth(new Date().getMonth() + monthNav);
  }
  const weekdays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const month = date.getMonth();
  const year = date.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstMonthDay = new Date(year, month, 1);
  const dateString = firstMonthDay.toLocaleDateString("en-LT", {
    weekday: "long",
    month: "numeric",
    year: "numeric",
  });
  prevMonthDays = weekdays.indexOf(dateString.split(" ")[1].toLowerCase());

  document.querySelector(
    ".header__date"
  ).textContent = `${year} ${date.toLocaleDateString("en-LT", {
    month: "long",
  })}`;

  for (let i = 1; i <= prevMonthDays + daysInMonth; i++) {
    const daySquare = document.createElement("div");
    if (i > prevMonthDays) {
      daySquare.classList.add("main__calendar__day");
      daySquare.textContent = i - prevMonthDays;
    } else {
      daySquare.classList.add("prevMonthDay");
    }
    daySquare.id = new Date(year, month, i - prevMonthDays + 1)
      .toISOString()
      .split("T")[0];
    daySquare.addEventListener("click", () => {
      dateInput.value = daySquare.id;
      dayNav = daySquare.id;
      highlightDay();
    });
    calendar.append(daySquare);
  }
  highlightDay();
};

const changeMonth = () => {
  document.getElementById("back").addEventListener("click", () => {
    --monthNav;
    renderCalendar();
    drawTask();
    showEventDetails();
  });
  document.getElementById("next").addEventListener("click", () => {
    ++monthNav;
    renderCalendar();
    drawTask();
    showEventDetails();
  });
};

const submitTask = () => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let title = document.getElementById("title").value;
    let date = dateInput.value;
    let startTime = document.getElementById("startTime").value;
    let endTime = document.getElementById("endTime").value;
    let type = document.getElementById("type").value;
    let description = document.getElementById("description").value;
    const error = document.createElement("div");
    error.classList.add("error");
    error.textContent = "There already is an event for this time and date";
    form.prepend(error);

    const removeError = () => {
      document.getElementsByClassName("error").length > 1
        ? error.remove()
        : null;
    };

    if (
      title === "" ||
      date === "" ||
      startTime === "" ||
      endTime === "" ||
      type === ""
    ) {
      error.textContent = "Please fill out the required fields";
      removeError();
    } else {
      const doesTaskTimeExist = tasks.find(
        (item) => item.startTime === startTime && item.date === date
      );
      if (doesTaskTimeExist) {
        removeError();
      } else {
        error?.remove();
        document.querySelector(".error")?.remove();
        tasks.push({ title, date, startTime, endTime, type, description });

        document.getElementById("form").reset();
        saveData();
        showWindow();
        drawTask();
      }
    }
  });
};
const drawTask = () => {
  removeTask();
  const daySquare = document.querySelectorAll(".main__calendar__day");
  tasks.forEach((item) => {
    daySquare.forEach((square, i) => {
      const eventBox = document.createElement("div");
      const eventBoxTitle = document.createElement("p");
      if (item.date === square.id) {
        eventBox.classList.add("main__calendar__day__event");
        eventBoxTitle.classList.add("main__calendar__day__event__text");
        eventBoxTitle.textContent = item.title;
        eventBox.append(eventBoxTitle);
        eventBox.value = { startTime: item.startTime, date: item.date };
        if (item.type === "meeting") {
          eventBox.id = "meeting";
        }
        if (item.type === "call") {
          eventBox.id = "call";
        }
        if (item.type === "ooo") {
          eventBox.id = "ooo";
        }

        square.append(eventBox);
      }
    });
  });
  showEventDetails();
};
document
  .querySelector(".main__calendar__day")
  ?.addEventListener("click", () => {});
const focusFormInputs = () => {
  const validationMsg = document.createElement("p");
  validationMsg.classList.add("alert");
  const title = document.getElementById("title");
  const date = document.getElementById("date");
  const startTime = document.getElementById("startTime");
  const endTime = document.getElementById("endTime");
  const type = document.getElementById("type");
  const description = document.getElementById("description");
  const renderMessage = (element, string) => {
    validationMsg.textContent = string;
    element.append(validationMsg);
  };
  title.addEventListener("focus", () => {
    renderMessage(
      document.getElementById("titleDiv"),
      "Required, max length 50 characters"
    );
  });
  date.addEventListener("focus", () => {
    renderMessage(document.getElementById("dateDiv"), "Required");
  });
  startTime.addEventListener("focus", () => {
    renderMessage(document.getElementById("startTimeDiv"), "Required");
  });
  endTime.addEventListener("focus", () => {
    renderMessage(document.getElementById("endTimeDiv"), "Required");
  });
  type.addEventListener("focus", () => {
    renderMessage(document.getElementById("typeDiv"), "Required");
  });
  description.addEventListener("focus", () => {
    renderMessage(document.getElementById("descriptionDiv"), "Optional");
  });
};

const setMinTimeValue = () => {
  document.getElementById("startTime").addEventListener("change", () => {
    let timeArr = document.getElementById("startTime").value.split(":");
    timeArr = [timeArr[0], Number(timeArr[1]) + 0o1].join(":");
    document.getElementById("endTime").min = timeArr;
  });
};

const onDateChange = () => {
  dateInput.addEventListener("change", () => {
    dayNav = dateInput.value;
    highlightDay();
  });
};
const highlightDay = () => {
  document.querySelectorAll(".main__calendar__day").forEach((square) => {
    square.id === dayNav
      ? square.classList.add("highlighted")
      : square.classList.remove("highlighted");
  });
};

const showWindow = () => {
  const detailsView = document.querySelector(".main__detailsView");
  const createView = document.querySelector(".main__createView");
  const createViewBtn = document.getElementById("createView-btn");
  const detailsViewBtn = document.getElementById("detailsView-btn");

  createViewBtn.addEventListener("click", () => {
    detailsView?.classList.add("hidden");
    createView?.classList.remove("hidden");
  });
  detailsViewBtn.addEventListener("click", () => {
    detailsView?.classList.remove("hidden");
    createView?.classList.add("hidden");
  });
  document
    .querySelectorAll(".main__calendar__day__event")
    ?.forEach((eventItem) => {
      eventItem.addEventListener("click", () => {
        detailsView?.classList.remove("hidden");
        createView?.classList.add("hidden");
      });
    });
  document.querySelectorAll(".main__calendar__day").forEach((day) => {
    day.addEventListener("click", () => {
      if (!tasks.length) {
        detailsView?.classList.add("hidden");
        createView?.classList.remove("hidden");
      }
      const doesTaskExist = tasks?.find((task) => task.date === day.id);
      if (doesTaskExist) {
        detailsView?.classList.remove("hidden");
        createView?.classList.add("hidden");
      } else {
        detailsView?.classList.add("hidden");
        createView?.classList.remove("hidden");
      }
    });
  });
};

const showEventDetails = () => {
  const detailsView = document.querySelector(".main__detailsView");
  detailsView.textContent = null;
  const emptyEventMsg = document.createElement("h2");
  emptyEventMsg.textContent = "There is no event for this date";
  const title = document.createElement("p");
  const date = document.createElement("p");
  const startTime = document.createElement("p");
  const endTime = document.createElement("p");
  const type = document.createElement("p");
  const description = document.createElement("p");
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete item";
  let typeText;
  deleteBtn.classList.add("btn", "btn--delete");
  document
    .querySelectorAll(".main__calendar__day__event")
    ?.forEach((eventItem) => {
      const currentTasks = tasks.filter(
        (task) =>
          task.date === eventItem.value.date &&
          eventItem.value.startTime === task.startTime
      );
      currentTasks.forEach((task) => {
        eventItem.addEventListener("click", () => {
          eventNav = {
            date: task.date,
            startTime: task.startTime,
            endTime: task.endTime,
          };
          detailsView.textContent = null;
          if (
            eventItem.value.date === task.date &&
            eventItem.value.startTime === task.startTime
          ) {
            title.textContent = `Title: ${task.title}`;
            date.textContent = `Date: ${task.date}`;
            startTime.textContent = `Start Time: ${task.startTime}`;
            endTime.textContent = `End Time: ${task.endTime}`;
            if (task.type === "meeting") {
              typeText = "Meeting";
            }
            if (task.type === "call") {
              typeText = "Call";
            }
            if (task.type === "ooo") {
              typeText = "Out Of Office";
            }
            type.textContent = `Type: ${typeText}`;
            description.textContent =
              task.description && `Description: ${task.description}`;
            detailsView.append(
              title,
              date,
              startTime,
              endTime,
              type,
              description,
              deleteBtn
            );
          }
          showWindow();
          deleteItem();
        });
      });
    });
};
const deleteItem = () => {
  let taskNumber;
  document.querySelector(".btn--delete")?.addEventListener("click", () => {
    taskNumber = tasks.findIndex((task) => {
      return (
        task.date === eventNav.date && task.startTime === eventNav.startTime
      );
    });
    document
      .querySelectorAll(".main__calendar__day__event")
      .forEach((eventItem) => {
        eventItem.textContent = null;
      });
    if (taskNumber >= 0) {
      tasks.splice(taskNumber, 1);
    }
    saveData();
    drawTask();
  });
};
const saveData = () => {
  sessionStorage.setItem(DATA_KEY, JSON.stringify(tasks));
};
const getLocalStorageData = () => {
  window.addEventListener("DOMContentLoaded", () => {
    const sessionData = sessionStorage.getItem(DATA_KEY);
    if (sessionData) {
      tasks = JSON.parse(sessionData);
      drawTask();
    }
  });
};
const removeTask = () => {
  document.querySelectorAll(".main__calendar__day__event").forEach((event) => {
    if (
      event.value.startTime === event.value.startTime &&
      event.value.date === event.value.date
    ) {
      event.remove();
    }
  });
};
getLocalStorageData();
renderCalendar();
changeMonth();
setMinTimeValue();
submitTask();
focusFormInputs();
drawTask();
highlightDay();
onDateChange();
showWindow();
showEventDetails();
