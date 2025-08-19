CAC_VIEW = {
  isDev: true, // 개발모드
  calendar: null, // 캘린더 DOM
  basic_setting: null, // 기본설정
  calendar_list: null, // 캘린더 데이터
  calendar_group_list: null, // 캘린더 그룹 데이터
  promotion_data: null, // 마켓프로모션 데이터
  season_data: null, // 시즌이벤트 데이터
  group_id: null, // 캘린더 그룹코드
  holiday: null, // 공휴일
  debounceSearch: null, // 검색 디바운스
  token: null, // 토큰
  member_id: null, // 멤버아이디
  group_no: null, // 그룹번호

  set basicSetting(value) {
    this.basic_setting = value;
  },

  set calendarList(value) {
    this.calendar_list = value;
  },
  get calendarList() {
    if (!!this.group_id) {
      return this.calendar_list.filter((event) => event.calendar_group_id === this.group_id);
    }
    return this.calendar_list;
  },

  set calendarGroupList(value) {
    this.calendar_group_list = value;
  },
  get calendarGroupList() {
    if (!!this.group_id) {
      return this.calendar_group_list.filter(
        (group) => group._id === this.group_id && group.use_single_calendar === 'T',
      );
    } else {
      // calendar_group
      const calendarGroup = this.calendar_group_list
        .filter((group) => group.category === 'MY' && group.type === 'MY' && group.display_front === 'T')
        .sort((a, b) => {
          return a.sort - b.sort;
        });

      // 시즌 이벤트
      const seasonEventGroup = this.calendar_group_list
        .filter((group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT' && group.display_front === 'T')
        .sort((a, b) => {
          return a.sort - b.sort;
        });

      // 마켓프로모션
      const promotionGroup = this.calendar_group_list
        .filter(
          (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION' && group.display_front === 'T',
        )
        .sort((a, b) => {
          return a.sort - b.sort;
        });

      return [...calendarGroup, ...seasonEventGroup, ...promotionGroup];
    }
  },
  set groupId(value) {
    this.group_id = value;
  },

  set holidayList(value) {
    this.holiday = value;
  },
  get holidayList() {
    return this.holiday;
  },

  get eventList() {
    const eventList = [];
    this.calendar_list &&
      this.calendarList.forEach((event) => {
        if (this.group_id && event.calendar_group_id !== this.group_id) {
          return;
        }

        const group = this.calendarGroupList.find((group) => group._id === event.calendar_group_id);
        eventList.push({
          ...event,
          color: group?.group_color ?? '',
          id: event._id,
          start: event.is_day === 'T' ? moment(event.start_datetime).format('YYYY-MM-DD') : event.start_datetime || '',
          end:
            !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T'
              ? moment(event.end_datetime).add(1, 'day').format('YYYY-MM-DD')
              : event.end_datetime || '',
          groupId: event.calendar_group_id || '',
          allDay: !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T',
          is_promotion: false,
        });
      });
    return eventList;
  },

  // 캘린더 데이터를 파싱하여 이벤트 리스트로 반환
  parseEvent(calendarList) {
    const eventList = [];
    calendarList.forEach((event) => {
      if (this.group_id && event.calendar_group_id !== this.group_id) {
        return;
      }

      const group = this.calendarGroupList.find((group) => group._id === event.calendar_group_id);
      eventList.push({
        ...event,
        color: group?.group_color ?? '',
        id: event._id,
        start: event.is_day === 'T' ? moment(event.start_datetime).format('YYYY-MM-DD') : event.start_datetime || '',
        end:
          !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T'
            ? moment(event.end_datetime).add(1, 'day').format('YYYY-MM-DD')
            : event.end_datetime || '',
        groupId: event.calendar_group_id || '',
        allDay: !moment(event.end_datetime).isSame(moment(event.start_datetime), 'day') || event.is_day === 'T',
        is_promotion: false,
      });
    });
    return eventList;
  },

  parsePromotionEvent(promotionData) {
    const promotionGroup = this.calendarGroupList.find(
      (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION',
    );

    if (!promotionGroup) return;
    const promotionList = [];
    promotionData.forEach((item) => {
      if (promotionGroup?.includes?.includes(item.market_code) === false) return;

      promotionList.push({
        _id: item.board_no,
        id: item.board_no,
        description: item.body,
        title: `[${item.market_name}] ${item.promotion_title || item.title}`,
        color: promotionGroup?.group_color || '',
        is_promotion: true,
        start_datetime: item.market_reg_timestamp,
        end_datetime: item.market_reg_timestamp,
        start: item.market_reg_timestamp,
        end: item.market_reg_timestamp,
        is_day: 'F',
        allDay: true,
        is_complete: 'F',
        is_important: 'F',
        calendar_group_id: promotionGroup?._id,
        calendar_group_category: 'PROMOTION',
        calendar_group_type: 'MARKET_PROMOTION',
      });
    });
    return promotionList;
  },

  parseSeasonEvent(seasonEventData) {
    const seasonEventList = [];
    const seasonEventGroup = this.calendarGroupList.find(
      (group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT',
    );
    if (!seasonEventGroup) return;

    seasonEventData.forEach((item) => {
      if (seasonEventGroup?.includes?.includes(item.type) === false) return;

      seasonEventList.push({
        _id: item.id,
        id: item.id,
        title: item.title,
        color: seasonEventGroup?.group_color || '',
        is_promotion: true,
        start_datetime: item.start_datetime,
        end_datetime: !!item.end_datetime ? item.end_datetime : item.start_datetime,
        start: item.start_datetime,
        end: !!item.end_datetime ? moment(item.end_datetime).add(1, 'day').format('YYYY-MM-DD') : '',
        is_day: 'T',
        allDay: true,
        is_complete: item.is_complete ?? 'F',
        is_important: item.is_important ?? 'F',
        calendar_group_id: seasonEventGroup?._id,
        calendar_group_category: 'SEASON',
        calendar_group_type: 'SEASON_EVENT',
      });
    });
    return seasonEventList;
  },

  // 접근권한 체크
  checkPermission: function () {
    /**
     * 프론트에서 전체캘린더 노출시 기본설정의 접근권한을 타고,
     * 단독은 그룹의 접근 권한을 타고
     * this.basic_setting.front_use_permission === T:전체|F:회원만
     */
    let isTrue = true;
    if (this.group_id === null) {
      if (this.member_id === CAFE24API.MALL_ID) return isTrue;
      if (this.basic_setting?.front_use_permission === 'T') {
        const Index = this.basic_setting?.front_permission.find((item) => item.group_no === CAC_VIEW.group_no);

        if (!Index) {
          isTrue = false;
        }
      }
    } else {
      if (this.member_id === CAFE24API.MALL_ID) return isTrue;
      const group = this.calendarGroupList.find((group) => group._id === this.group_id);
      if (group?.single_calendar_use_front_permission === 'T') {
        const Index = group?.single_calendar_front_permission.find((item) => item.group_no === CAC_VIEW.group_no);
        if (!Index) {
          isTrue = false;
        }
      }
    }

    return isTrue;
  },

  // 캘린더 타이틀
  setCalendarTitle: function () {
    if (this.group_id == null || this.group_id === '') {
      // 전체 캘린더명 설정
      const groupCalendarName = CAC_CAFE24API.getSiteName() ?? '';
      CAC$('.eShopName', CAC.getRoot()).text(`${CAC_VIEW.decodeHTMLEntities(groupCalendarName)} 캘린더`);
    } else {
      // 단독 캘린더 그룹명
      const groupCalendarName =
        this.calendarGroupList[0]?.use_front_group_name === 'T'
          ? this.calendarGroupList[0]?.front_group_name
          : this.calendarGroupList[0]?.group_name;

      // 단독 캘린더명 설정
      CAC$('.eShopName', CAC.getRoot()).text(`${CAC_VIEW.decodeHTMLEntities(groupCalendarName)} 캘린더`);
    }
  },
  // 캘린더 그룹
  setCalendarGroup: function (groupCode) {
    CAC$('.calendar_filter .calendar_list', CAC.getRoot()).html('');
    if (this.calendarGroupList.length === 0) {
      CAC$('.calendar_filter .btn_select', CAC.getRoot()).css('padding-right', '0px');
      CAC$('.calendar_filter .btn_select', CAC.getRoot()).css('height', '28px');
      CAC$('.calendar_filter .calendar_list_wrap', CAC.getRoot()).remove();

      // .calendar_filter > button  remove btn_select class
      CAC$('.calendar_filter > button', CAC.getRoot()).removeClass('btn_select');

      return;
    }

    let groupHtml = '';
    this.calendarGroupList.forEach(function (item) {
      let group = document.createElement('div');
      group.classList.add('calendar_group');
      group.setAttribute('group-code', item.group_code);
      groupHtml += `
				<li>
					<label class="label_ckeck">
						<input type="checkbox" class="event_filter" name="event_filter" data-type="group" id="${item._id}" value="${item._id}" checked>
						<span class="check_mark
						" style="background:${item.group_color}; border-color:${item.group_color}"></span>
						<span class="check_text">${item.use_front_group_name === 'T' ? item.front_group_name : item.group_name}</span>
					</label>
				</li>
			`;
    });

    CAC$('.calendar_filter .calendar_list', CAC.getRoot()).html(groupHtml);
  },

  getStartCalendar: function (source) {
    return CAC_UTIL.isMobile()
      ? source?.single_calendar_front_start_calendar_mobile || source?.front_start_calendar_mobile
      : source?.single_calendar_front_start_calendar || source?.front_start_calendar;
  },

  /**
   * 초기 뷰 설정
   * @returns {string}
   */
  computedInitialView: function () {
    let startCalendar;
    // 단독캘린더시
    if (!!this.group_id) {
      const calendarGroup = this.calendarGroupList.find((group) => group._id === this.group_id);
      startCalendar = this.getStartCalendar(calendarGroup);
    } else {
      startCalendar = this.getStartCalendar(this.basic_setting);
    }

    switch (startCalendar) {
      case 'W':
        return 'timeGridWeek';
      case 'D':
        return 'timeGridDay';
      default:
        return 'dayGridMonth';
    }
  },

  /**
   * 시작 요일 설정
   * @returns {number}
   */
  getStartWeek: function (source) {
    return source?.single_calendar_front_start_week || source?.front_start_week;
  },
  computedStartWeek: function () {
    let startWeek;
    // 단독캘린더시
    if (!!this.group_id) {
      const calendarGroup = this.calendarGroupList.find((group) => group._id === this.group_id);
      startWeek = this.getStartWeek(calendarGroup);
    } else {
      startWeek = this.getStartWeek(this.basic_setting);
    }

    return startWeek === 'M' ? 1 : 0;
  },

  /**
   * 표시 제한 설정
   * @returns {*|number}
   */
  computedDisplayLimit: function () {
    return this.basic_setting?.display_limit || 999;
  },

  /**calendar_list sorting */
  sortCalendarList: function (a, b) {
    // 1. 프로모션 여부 비교
    if (a?.is_promotion && !b?.is_promotion) {
      return 1;
    } else if (!a?.is_promotion && b?.is_promotion) {
      return -1;
    }

    // 2. 종일 여부 비교
    if (a?.is_day === 'T' && b?.is_day === 'F') {
      return -1;
    } else if (a?.is_day === 'F' && b?.is_day === 'T') {
      return 1;
    }

    return moment(a?.start_datetime).isBefore(moment(b?.start_datetime)) ? -1 : 1;
  },

  datesSetHandler: async function (dateInfo) {
    if (CAC_VIEW.calendarGroupList.length === 0) return;
    const beginDate = moment(dateInfo.start).format('YYYY-MM-DD');
    const endDate = moment(dateInfo.end).format('YYYY-MM-DD');

    const beginDateTime = moment(dateInfo.start).format('YYYY-MM-DD') + ' 00:00';
    const endDateTime = moment(dateInfo.end).format('YYYY-MM-DD') + ' 23:59';

    // 월달이동시 원격데이터 요청
    const calendar_list = await CAC_DATA.loadRemoteCalendarData(beginDateTime, endDateTime);
    const filterCalendarList = this.group_id
      ? calendar_list?.lists
      : calendar_list?.lists.filter((item) => item.display_front !== 'F');
    this.calendarList = filterCalendarList ?? [];

    // 마켓프로모션 데이터 요청
    const promotionGroup = this.calendarGroupList.find(
      (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION',
    );

    if (!this.group_id && promotionGroup?.display_front !== 'T') {
      CAC_VIEW.promotion_data = [];
    } else {
      const promotionRemoteData =
        (promotionGroup && (await CAC_DATA.loadMarketPromotionData(beginDate, endDate))) || [];
      const filterPromotionData = this.group_id
        ? promotionRemoteData
        : promotionRemoteData.filter((item) => item.display_front !== 'F');
      CAC_VIEW.promotion_data = promotionGroup ? CAC_VIEW.parsePromotionEvent(filterPromotionData) : [];
    }

    // 시즌 이벤트 데이터 요청
    const seasonEventGroup = this.calendarGroupList.find(
      (group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT',
    );

    if (!this.group_id && seasonEventGroup?.display_front !== 'T') {
      CAC_VIEW.season_data = [];
    } else {
      const seasonEventRemoteData =
        (seasonEventGroup && (await CAC_DATA.loadSeasonEventData(beginDate, endDate))) || [];
      const filterSeasonEventData = this.group_id
        ? seasonEventRemoteData
        : seasonEventRemoteData.filter((item) => item.display_front !== 'F');
      CAC_VIEW.season_data = seasonEventGroup ? CAC_VIEW.parseSeasonEvent(filterSeasonEventData) : [];
    }

    // 새 이벤트를 기존 이벤트에 추가
    this.calendar_list = [...this.calendarList];
    this.calendar.removeAllEvents();

    this.calendar.addEventSource([...this.eventList, ...CAC_VIEW.promotion_data, ...CAC_VIEW.season_data]);
    this.calendar.render();
  },

  // 일반 캘린더 (pc)
  renderCalendar: function () {
    // 일반 캘린더
    let calendarEl = CAC.getRoot().getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'ko',
      buttonText: {
        today: '오늘',
        month: '월',
        week: '주',
        day: '일',
        list: 'list',
      },
      titleFormat: {
        year: 'numeric',
        month: 'long',
        //day: 'numeric'
      },
      dayHeaderFormat: {
        weekday: 'long',
      },
      dayHeaderContent: (args) => {
        let headerDay = document.createElement('span');
        let headerWeek = document.createElement('span');

        headerDay.classList.add('date');

        if (args.view.type === 'timeGridDay' || args.view.type === 'timeGridWeek') {
          if (moment(args.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            headerDay.style.color = 'red';
            headerWeek.style.color = 'red';
          }
          headerDay.innerHTML =
            args.view.type === 'timeGridDay'
              ? moment(args.date).format('Do').replace('일', '')
              : moment(args.date).format('Do');
          headerWeek.innerHTML =
            args.view.type === 'timeGridDay' ? moment(args.date).format(' dd') : moment(args.date).format(' (dd)');
          return {
            html: headerDay.outerHTML + headerWeek.outerHTML,
          };
        } else if (args.view.type === 'dayGridMonth') {
          return moment(args.date).format('dddd');
        }
      },
      dayCellContent: (info) => {
        let number = document.createElement('a');
        number.classList.add('fc-daygrid-day-number');
        number.innerHTML = info.dayNumberText.replace('일', '').replace('日', '');

        let holidayEl = document.createElement('span');
        holidayEl.style.color = 'red';

        // 공휴일 설정
        if (CAC_VIEW.holiday) {
          if (moment(info.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            holidayEl.innerHTML = CAC_VIEW.holiday[moment(info.date).format('YYYY-MM-DD')];
            number.style.color = 'red';
          }
        }

        if (info.view.type === 'dayGridMonth') {
          return {
            html: number.outerHTML + holidayEl.outerHTML,
          };
        }
        return {
          domNodes: [],
        };
      },
      // style
      initialView: this.computedInitialView(),
      height: 'auto',
      slotMinTime: '00:00',
      slotMaxTime: '24:00',
      navLinks: false, // 요일, 날짜 클릭 시 일/주 단위 화면으로 넘어감
      expandRows: true,
      editable: false, // 드래그 수정 여부
      selectable: false, //
      nowIndicator: true, //
      showNonCurrentDates: true, // 이전, 다음 달 날짜 표시
      fixedWeekCount: false,
      datesSet: function (dateInfo) {
        CAC_VIEW.datesSetHandler(dateInfo);
      },
      eventOrder: ['-is_promotion', '-is_day', 'start_datetime', 'end_datetime'],
      slotEventOverlap: false,
      firstDay: this.computedStartWeek(),
      dayMaxEvents: this.computedDisplayLimit(), // "more" 표시 전 최대 이벤트 갯수. true - 셀 높이에 따라 결정
      scrollTime:
        (this.computedInitialView() === 'timeGridDay' || this.computedInitialView() === 'timeGridWeek') &&
        moment().subtract(8, 'hover').format('HH:mm:ss'),

      eventDisplay: 'block',

      headerToolbar: {
        left: '',
        center: 'prev,title,next,today',
        right: 'timeGridDay,timeGridWeek,dayGridMonth',
      },

      ///event layer
      eventClick: async (info) => {
        info.jsEvent.preventDefault();

        const eventInfo = info.event;
        const eventTitle = eventInfo.title;
        const eventDesc = eventInfo.extendedProps.description;
        const eventUrl = eventInfo.extendedProps.external_link_url;
        const eventBoard = eventInfo.extendedProps.link_board_article;
        const eventImage = eventInfo.extendedProps?.link_products;
        const eventCategories = eventInfo.extendedProps?.link_categories;

        const layer = CAC$('#layerCalendarEvent', CAC.getRoot());
        const layerTitle = layer.find('h1');
        const layerCont = layer.find('.cont');
        if (!eventInfo.extendedProps.is_promotion) {
          CAC_VIEW.renderThirdPartyCalGroups(
            layer,
            eventInfo.extendedProps.calendar_group_id || '',
            eventInfo.extendedProps._id || '',
            eventTitle,
            eventInfo.extendedProps.start_datetime || '',
            eventInfo.extendedProps.end_datetime || '',
            '',
            eventInfo.extendedProps.is_day || 'F',
          );
        } else {
          layer.find('.calendar_groups').html('');
        }

        layer.css('display', 'block');
        layerTitle.text(eventTitle);
        layerCont.find('div').remove();

        if (eventInfo.extendedProps.is_day === 'T') {
          if (
            moment(eventInfo.extendedProps.start_datetime).isSame(eventInfo.extendedProps.end_datetime, 'day') ||
            eventInfo.end === null
          ) {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')}</div>`,
            );
          } else {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD')}</div>`,
            );
          }
        } else {
          layerCont.append(
            `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD HH:mm')}</div>`,
          );
        }

        if (eventImage && eventImage.length > 0) {
          let imagesHTML = '';

          for (const item of eventImage) {
            const productHTML = await this.renderProductDetailView(item);
            if (productHTML) {
              imagesHTML += productHTML;
            }
          }
          if (!!imagesHTML) {
            layerCont.append(`<div class="image"><ul>${imagesHTML}</ul></div>`);
          }
        }

        if (eventCategories && eventCategories.length > 0) {
          const categoriesHTML = this.generateCategoriesHTML(eventCategories);
          if (!!categoriesHTML) {
            layerCont.append(categoriesHTML);
          }
        }

        if (typeof eventBoard === 'object' && Object.keys(eventBoard).length > 0) {
          let urlHTML = `<a href="${CAC_VIEW.getBoardLink(
            eventBoard.board_name,
            eventBoard.board_no,
            eventBoard.article_no,
          )}" target="_blank">${eventBoard?.title}</a>`;
          layerCont.append(`<div class="board">${urlHTML}</div>`);
        }

        if (!eventUrl == '' || !eventUrl == undefined) {
          const newUrl =
            eventUrl.includes('http://') || eventUrl.includes('https://') ? eventUrl : 'http://' + eventUrl;
          let urlHTML = `<a href="${newUrl}" target="_blank">${eventUrl}</a>`;
          layerCont.append(`<div class="url">${urlHTML}</div>`);
        }

        if (!eventDesc == '' || !eventDesc == undefined) {
          layerCont.append(`<div class="description">${eventDesc}</div>`);
        }
      },
      eventContent: (info) => {
        let titleProfix = '';
        if (info.event.extendedProps.is_day !== 'T' && info.event.extendedProps.is_promotion !== true) {
          titleProfix = moment(info.event.extendedProps.start_datetime).format('A hh:mm');
        }

        let dom = null;

        dom = document.createElement('div');
        dom.className = 'fc-event-title';
        dom.style.padding = '2px';
        dom.style.cursor = 'pointer';

        if (info.event.extendedProps.is_complete === 'T') {
          const del = document.createElement('del');
          del.innerText = `${titleProfix} ${info.event.title}`;
          dom.appendChild(del);
        } else {
          dom.innerText = `${titleProfix} ${info.event.title}`;
        }

        return {
          domNodes: [dom],
        };
      },
      eventClassNames: function (info) {
        let result = true;
        let groups = [];
        CAC.getRoot()
          .querySelectorAll('input[name="event_filter"]:checked')
          .forEach(function (item) {
            const type = item.getAttribute('data-type');
            if (type === 'group') {
              groups.push(item.value);
            }
          });

        // 체크 된 일정 클래스 추가
        if (groups.length > 0) {
          result = result && groups.indexOf(info.event.extendedProps?.calendar_group_id) >= 0;
        } else {
          result = false;
        }

        // 체크되지 않은 일정 클래스 추가
        if (!result) {
          result = 'filter-hidden';
        }

        return result;
      },
      events: [],
    });

    calendar.render();

    CAC.getRoot()
      .querySelectorAll('input[name="event_filter"]')
      .forEach(function (item) {
        item.addEventListener('change', function () {
          calendar.render();
        });
      });

    this.calendar = calendar;
  },

  renderCalendarMobile: function (initialView) {
    // 일반 캘린더
    let calendarEl = CAC.getRoot().getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'ko',
      buttonText: {
        today: '오늘',
        month: '월',
        week: '주',
        day: '일',
        list: 'list',
      },
      titleFormat: {
        year: 'numeric',
        month: 'long',
        //day: 'numeric'
      },
      dayHeaderFormat: {
        weekday: 'short',
      },
      dayHeaderContent: (args) => {
        let headerDay = document.createElement('span');
        let headerWeek = document.createElement('span');

        headerDay.classList.add('date');

        headerDay.innerHTML = moment(args.date).format('Do').replace('일', '');
        headerWeek.innerHTML = moment(args.date).format(' dd');

        if (args.view.type === 'timeGridDay' || args.view.type === 'timeGridWeek') {
          if (moment(args.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            headerDay.style.color = 'red';
            headerWeek.style.color = 'red';
          }
          return {
            html: headerDay.outerHTML + headerWeek.outerHTML,
          };
        } else if (args.view.type === 'dayGridMonth') {
          return moment(args.date).format('dd');
        }
      },
      dayCellContent: (info) => {
        let number = document.createElement('a');
        number.classList.add('fc-daygrid-day-number');
        number.innerHTML = info.dayNumberText.replace('일', '').replace('日', '');

        if (info.view.type === 'dayGridMonth') {
          // 공휴일 설정
          if (moment(info.date).format('YYYY-MM-DD') in CAC_VIEW.holiday) {
            number.style.color = 'red';
          }
          return {
            html: number.outerHTML,
          };
        }
        return {
          domNodes: [],
        };
      },

      // style
      initialView: this.computedInitialView(),
      height: '700px',
      slotMinTime: '00:00',
      slotMaxTime: '24:00',
      navLinks: false, // 요일, 날짜 클릭 시 일/주 단위 화면으로 넘어감
      expandRows: true,
      editable: false, // 드래그 수정 여부
      selectable: false, //
      nowIndicator: true, //
      dayMaxEvents: this.computedDisplayLimit(),
      eventDisplay: 'block',
      showNonCurrentDates: true, // 이전, 다음 달 날짜 표시
      fixedWeekCount: false,
      eventOrder: ['-is_promotion', '-is_day', 'start_datetime', 'end_datetime'],
      slotEventOverlap: false,
      scrollTime:
        (this.computedInitialView() === 'timeGridDay' || this.computedInitialView() === 'timeGridWeek') &&
        moment().subtract(8, 'hover').format('HH:mm:ss'),
      firstDay: this.computedStartWeek(),
      headerToolbar: {
        left: '',
        center: 'prev,title,next,today',
        right: 'timeGridDay,timeGridWeek,dayGridMonth',
      },
      datesSet: function (dateInfo) {
        CAC_VIEW.datesSetHandler(dateInfo);
      },

      dateClick: function (info) {
        info.jsEvent.preventDefault();
        if (info.view.type === 'dayGridMonth') {
          const currentDate = moment(info.date).format('YYYY-MM-DD');
          const dateDD = moment(info.date).format('D');
          const datedd = moment(info.date).format('dd');
          const eventTitle = `${dateDD}일 (${datedd})`;

          const layer = CAC$('#layerAllEvent', CAC.getRoot());
          const layerTitle = layer.find('h1');
          layerTitle.html(eventTitle);

          // layer .cont .events
          const layerCont = layer.find('.cont');
          layerCont.find('.events').remove();

          const calendarData = CAC_VIEW.eventList.filter((item) => {
            // check info.date in info.start and info.end
            // day
            const infoDate = moment(info.date).format('YYYY-MM-DD');
            const startDate = moment(item.start_datetime).format('YYYY-MM-DD');
            const endDate = moment(item.end_datetime).format('YYYY-MM-DD');

            return moment(infoDate).isBetween(startDate, endDate, null, '[]');
          });

          // 마켓 프로모션
          const promotionData = CAC_VIEW.promotion_data.filter((item) => {
            const infoDate = moment(info.date).format('YYYY-MM-DD');
            const startDate = moment(item.start_datetime).format('YYYY-MM-DD');
            const endDate = moment(item.end_datetime).format('YYYY-MM-DD');

            return moment(infoDate).isBetween(startDate, endDate, null, '[]');
          });

          // 시즌 이벤트
          const seasonEventData = CAC_VIEW.season_data.filter((item) => {
            const infoDate = moment(info.date).format('YYYY-MM-DD');
            const startDate = moment(item.start_datetime).format('YYYY-MM-DD');
            const endDate = moment(item.end_datetime).format('YYYY-MM-DD');

            return moment(infoDate).isBetween(startDate, endDate, null, '[]');
          });

          const checkedEventFilter = CAC.getRoot().querySelectorAll('input[name="event_filter"]:checked');
          const checkedEventFilterArray = Array.from(checkedEventFilter);
          const checkedEventFilterIds = checkedEventFilterArray.map((item) => item.value);

          const events = [...calendarData, ...promotionData, ...seasonEventData].filter((event) => {
            return checkedEventFilterIds.includes(event.calendar_group_id);
          });

          if (events.length === 0) {
            return;
          }

          const eventsHtml = events
            .sort(CAC_VIEW.sortCalendarList)
            .map((event) => {
              let eventStart = '';
              let eventEnd = '';
              if (event.is_day === 'T') {
                eventStart = moment(event.start_datetime).format('YYYY.MM.DD');
                eventEnd = moment(event.end_datetime).format('YYYY.MM.DD');
              } else {
                eventStart = moment(event.start_datetime).format('YYYY.MM.DD HH:mm');
                eventEnd = moment(event.end_datetime).format('YYYY.MM.DD HH:mm');
              }

              const titleEl = document.createElement('div');
              titleEl.classList.add('title');
              titleEl.innerText = event.title;

              return `<a href="javascript:void(0)" style="--eventColor: ${event.color};" onclick="
		CAC_VIEW.showDetail('${event.id}','${currentDate}')">
									${titleEl.outerHTML}
									<div class="date">${eventStart} ~ ${eventEnd}</div>
								</a>`;
            })
            .join('');

          layerCont.append(`<div class="events">${eventsHtml}</div>`);

          CAC_VIEW.appendDimed();
          layer.css('display', 'block');
        }
      },

      eventClick: async (info) => {
        info.jsEvent.preventDefault();
        if (info.view.type !== 'dayGridMonth') {
          const eventId = info.event.id;
          const currentDate = moment(info.event.start).format('YYYY-MM-DD');
          await CAC_VIEW.showDetail(eventId, currentDate);
        }
      },

      //event filter
      eventClassNames: function (info) {
        var result = true;
        var groups = [];

        CAC$("input[name='event_filter']:checked", CAC.getRoot()).each(function () {
          if (CAC$(this).data('type') == 'group') {
            groups.push(CAC$(this).val());
          }
        });

        if (groups.length > 0) {
          result = result && groups.indexOf(info.event.extendedProps?.calendar_group_id) >= 0;
        } else {
          result = false;
        }

        // 체크되지 않은 일정 클래스 추가
        if (!result) {
          result = 'filter-hidden';
        }
        return result;
      },

      eventContent: (info) => {
        let dom = null;

        dom = document.createElement('div');
        dom.className = 'fc-event-title';
        dom.style.padding = '2px';
        dom.style.cursor = 'pointer';

        if (info.event.extendedProps.is_complete === 'T') {
          const del = document.createElement('del');
          del.innerText = `${info.event.title}`;
          dom.appendChild(del);
        } else {
          dom.innerText = `${info.event.title}`;
        }

        return {
          domNodes: [dom],
        };
      },

      //event data
      events: this.eventList,
    });

    calendar.render();

    this.calendar = calendar;

    CAC$("input[name='event_filter']", CAC.getRoot()).change(function () {
      calendar.render();
    });
  },

  // 검색결과 캘린더
  renderSearchCalendar: function () {
    let calendarEl = CAC.getRoot().getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      // lang
      locale: 'ko',

      views: {
        listGridForAll: {
          type: 'list',
          visibleRange: (currentDate) => {
            return {
              start: moment(currentDate).subtract(10, 'year').format('YYYY-MM-DD'),
              end: moment(currentDate).add(10, 'year').format('YYYY-MM-DD'),
            };
          },
        },
      },
      // style
      initialView: 'listGridForAll',
      height: 'auto',
      slotMinTime: '00:00',
      slotMaxTime: '24:00',
      navLinks: false, // 요일, 날짜 클릭 시 일/주 단위 화면으로 넘어감
      expandRows: true,
      editable: false, // 드래그 수정 여부
      selectable: false, //
      nowIndicator: true, //
      dayMaxEvents: true, // "more" 표시 전 최대 이벤트 갯수. true - 셀 높이에 따라 결정
      eventDisplay: 'block',
      noEventsContent: '검색 결과가 없습니다.',

      headerToolbar: {
        left: '',
        center: '',
        right: '',
      },

      //event layer
      eventClick: async (info) => {
        info.jsEvent.preventDefault();
        const eventInfo = info.event;
        const eventTitle = eventInfo.title;
        const eventStart = conversion(eventInfo.start);
        const eventEnd = conversion(eventInfo.end);
        const eventDesc = eventInfo.extendedProps?.description;
        const eventUrl = eventInfo.extendedProps?.external_link_url;
        const eventImage = eventInfo?.extendedProps?.link_products;

        const layer = CAC$('#layerCalendarEvent', CAC.getRoot());
        const layerTitle = layer.find('h1');
        const layerCont = layer.find('.cont');
        const layerBtn = layer.find('.btn_wrap a');

        layerTitle.html(eventTitle);
        layerCont.find('div').remove();
        layerBtn.attr('href', '6_viewCalendar.html'); // 일정 상세 url

        if (eventInfo.allDay === true) {
          if (
            moment(eventInfo.extendedProps.start_datetime).isSame(eventInfo.extendedProps.end_datetime, 'day') ||
            eventInfo.end === null
          ) {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')}</div>`,
            );
          } else {
            layerCont.append(
              `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD')}</div>`,
            );
          }
        } else {
          layerCont.append(
            `<div class="date">${moment(eventInfo.extendedProps.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(eventInfo.extendedProps.end_datetime).format('YYYY-MM-DD HH:mm')}</div>`,
          );
        }

        if (eventImage && eventImage.length > 0) {
          let imagesHTML = '';
          for (const item of eventImage) {
            const productHTML = await this.renderProductDetailView(item);
            if (productHTML) {
              imagesHTML += productHTML;
            }
          }

          layerCont.append(`<div class="image"><ul>${imagesHTML}</ul></div>`);
        }

        if (!eventUrl == '' || !eventUrl == undefined) {
          const newUrl =
            eventUrl.includes('http://') || eventUrl.includes('https://') ? eventUrl : 'http://' + eventUrl;
          let urlHTML = `<a href="${newUrl}" target="_blank">${eventUrl}</a>`;
          layerCont.append(`<div class="url">${urlHTML}</div>`);
        }
        if (!eventDesc == '' || !eventDesc == undefined) {
          layerCont.append(`<div class="description">${eventDesc}</div>`);
        }

        function conversion(date) {
          if (!date == '' || !date == undefined) {
            moment.locale('ko');
            return moment(date).format('YYYY-MM-DD hh:mm');
            //return date.toISOString().substring(0,16).replace(/\T/g, ' ');
          } else {
            return null;
          }
        }

        if (CAC$('#calendar_wrap', CAC.getRoot()).hasClass('mobile')) {
          this.showDetail(eventInfo.id, eventStart);

          // calendar_head
          CAC$('#calendar_wrap #mobile_search_calendar_head', CAC.getRoot()).css('display', 'none');

          // var link = '2_calendar_m_detail.html';
          // window.open(link);
        } else {
          layer.css('display', 'block');
        }
      },

      //event data
      events: this.eventList,
    });
    calendar.render();

    this.calendar = calendar;
  },

  DOMContentLoaded: function () {
    function showBtnClear(_this) {
      if (_this.val() == '') {
        _this.siblings('.btn_clear').css('display', 'none');
      } else {
        _this.siblings('.btn_clear').css('display', 'block');
      }
    }

    //캘린더 검색
    showBtnClear(CAC$('.inputSearch .inputbox', CAC.getRoot()));
    CAC$('.inputSearch .inputbox', CAC.getRoot()).on('focus focusout input', function () {
      showBtnClear(CAC$(this));
    });

    //캘린더 검색 초기화
    CAC$('.inputSearch .btn_clear', CAC.getRoot()).on('click', function () {
      CAC$(this).siblings('.inputbox').val('');
      CAC$(this).siblings('.inputbox').focus();
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'none');
      if (CAC_UTIL.isMobile()) {
        CAC_VIEW.calendar.removeAllEvents();
      }
    });

    //캘린더 모바일 클릭 검색
    CAC$('.inputSearch .btn_search2', CAC.getRoot()).on('click', function () {
      const searchVal = CAC$(this).siblings('.inputbox').val();

      if (!searchVal) return;
      CAC_VIEW.debounceSearch(searchVal);
    });

    let calendarFilter = CAC$('.calendar_filter', CAC.getRoot());
    // 캘린더 목록 노출
    let btnSelect = calendarFilter.find('.btn_select');

    if (!!CAC_VIEW.group_id) {
      // .calendar_filter .btn_select::after
      btnSelect.addClass('group');
      btnSelect.css('padding-right', '0');
    }

    btnSelect.on('click', function () {
      // 전체 캘린더 일때만 동작 함
      if (!CAC_VIEW.group_id) {
        if (calendarFilter.hasClass('active')) {
          calendarFilter.removeClass('active');
        } else {
          calendarFilter.addClass('active');
        }
      }
    });

    // CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()) 밖의 영역 클릭시 숨김

    this.debounceSearch = CAC_UTIL.debounce(this.searchData, 500);

    this.searchInputByKeyup();
    this.searchEventClick();

    CAC$('.calendar_search .inputSearch #pcSearchBtn', CAC.getRoot()).on('click', function (e) {
      e.preventDefault();
      let searchVal = CAC$('.calendar_search .inputSearch .inputbox', CAC.getRoot()).val();
      CAC_VIEW.searchEvent(searchVal);
    });
    //this.pcSearchBtn();

    this.mobileSearchEvent();
  },

  searchInputByKeyup: function () {
    CAC$('.inputSearch .inputbox', CAC.getRoot()).on('keyup', function () {
      let searchVal = CAC$(this).val();
      if (!searchVal) return;
      CAC_VIEW.debounceSearch(searchVal);
    });
  },

  // 검색어 입력값 불법태그 제거
  removeIllegalTag: function (str) {
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#39;');
    str = str.replace(/`/g, '&#96;');
    str = str.replace(/\//g, '&#47;');
    str = str.replace(/\\/g, '&#92;');
    str = str.trim();
    return str;
  },
  searchedEventList: null,
  searchData: async function (searchVal) {
    const searchValue = this.removeIllegalTag(searchVal);

    if (!searchValue) return;
    const calendar_list = await CAC_DATA.loadRemoteCalendarData('', '', searchValue);

    // 마켓프로모션 데이터 요청
    const promotionGroup = CAC_VIEW.calendarGroupList.find(
      (group) => group.category === 'PROMOTION' && group.type === 'MARKET_PROMOTION',
    );

    let promotionData = [];
    if (promotionGroup?.display_front === 'T') {
      const promotionRemoteData =
        (await CAC_DATA.loadMarketPromotionData(
          moment().subtract(92, 'day').format('YYYY-MM-DD'),
          moment().format('YYYY-MM-DD'),
          searchValue,
        )) || [];
      promotionData = CAC_VIEW.parsePromotionEvent(promotionRemoteData);
    }

    // 시즌 이벤트 데이터 요청
    const seasonGroup = CAC_VIEW.calendarGroupList.find(
      (group) => group.category === 'SEASON' && group.type === 'SEASON_EVENT',
    );

    let seasonData = [];
    if (seasonGroup?.display_front === 'T') {
      const seasonRemoteData = (await CAC_DATA.loadSeasonEventData('', '', searchValue)) || [];
      seasonData = CAC_VIEW.parseSeasonEvent(seasonRemoteData);
    }

    const calendarData = this.parseEvent(calendar_list?.lists || []);
    this.searchedEventList = [...calendarData, ...promotionData, ...seasonData];

    if (!CAC_UTIL.isMobile()) {
      CAC_VIEW.searchEvent(searchValue);
    } else {
      this.calendarList = this.searchedEventList;
      this.renderSearchCalendar();
    }
  },
  // 이벤트 검색
  searchEvent: async function (value) {
    // 검색시 원격데이터 호출

    if (value === '') {
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'none');
      return;
    }

    if (value.length > 1) {
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'block');

      let searchedData = '';
      CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).empty();

      const searchedEvent = this.searchedEventList;
      if (searchedEvent.length === 0) {
        searchedData = '<div style="padding: 5px 10px">검색 결과가 없습니다.</div>';
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).css('height', 'auto');
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).html(
          `<div style="display: flex;justify-content: center">${searchedData}</div>`,
        );
      } else {
        searchedData = '';
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).css('height', 'auto');
        searchedEvent.forEach((item) => {
          const liEl = document.createElement('li');
          const aEl = document.createElement('a');
          aEl.setAttribute('href', 'javascript:void(0)');
          aEl.setAttribute('data-id', item._id);
          aEl.innerText = item.title;
          liEl.appendChild(aEl);

          searchedData += liEl.outerHTML;
        });
        CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).append(searchedData);
      }
    }
  },
  /**
   * 검색된 이벤트 클릭시 상세 정보 팝업
   */
  searchEventClick: function () {
    // .calendar_search_layer>ul>li 클릭 이벤트
    CAC$('.calendar_search .inputSearch .calendar_search_layer ul', CAC.getRoot()).on('click', 'li', function () {
      const searchVal = CAC$(this).text();
      let eventId = CAC$(this).find('a').data('id');

      const event = CAC_VIEW.searchedEventList.find((item, index) => {
        if (item._id === eventId) {
          return true;
        }
        if (
          item.calendar_group_category === 'PROMOTION' &&
          item.calendar_group_type === 'MARKET_PROMOTION' &&
          item.board_no === eventId
        ) {
          return true;
        }
        if (
          item.calendar_group_category === 'SEASON' &&
          item.calendar_group_type === 'SEASON_EVENT' &&
          item.id === parseInt(eventId)
        ) {
          return true;
        }
      });

      // set search value
      CAC$('.calendar_search .inputSearch .inputbox', CAC.getRoot()).val(searchVal);
      CAC$('.calendar_search .inputSearch .calendar_search_layer', CAC.getRoot()).css('display', 'none');

      // goto date
      CAC_VIEW.calendar.gotoDate(moment(event.start_datetime).format('YYYY-MM-DD'));
      CAC_VIEW.customEventClick(event);
    });
  },

  /**
   * 검색된 이벤트 클릭시 상세 정보 세팅
   * @param event
   */
  customEventClick: async function (event) {
    const eventInfo = event;
    const eventTitle = eventInfo.title;
    const eventDesc = eventInfo?.description;
    const eventBoard = eventInfo.link_board_article;
    const eventUrl = eventInfo?.external_link_url;
    const eventImage = eventInfo?.link_products;

    const layer = CAC$('#layerCalendarEvent', CAC.getRoot());
    const layerTitle = layer.find('h1');
    const layerCont = layer.find('.cont');

    layer.css('display', 'block');
    layerTitle.text(eventTitle);
    layerCont.find('div').remove();

    if (eventInfo.is_day === 'T') {
      if (moment(eventInfo.start_datetime).isSame(eventInfo.end_datetime, 'day') || !eventInfo.end) {
        layerCont.append(`<div class="date">${moment(eventInfo.start_datetime).format('YYYY-MM-DD')}</div>`);
      } else {
        layerCont.append(
          `<div class="date">${moment(eventInfo.start_datetime).format('YYYY-MM-DD')} ~ ${moment(eventInfo.end_datetime).format('YYYY-MM-DD')}</div>`,
        );
      }
    } else {
      layerCont.append(
        `<div class="date">${moment(eventInfo.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(eventInfo.end_datetime).format('YYYY-MM-DD HH:mm')}</div>`,
      );
    }

    if (eventImage && eventImage.length > 0) {
      let imagesHTML = '';
      for (const item of eventImage) {
        const productHTML = await this.renderProductDetailView(item);
        if (productHTML) {
          imagesHTML += productHTML;
        }
      }

      layerCont.append(`<div class="image"><ul>${imagesHTML}</ul></div>`);
    }

    if (typeof eventBoard === 'object' && Object.keys(eventBoard).length > 0) {
      let urlHTML = `<a href="${CAC_VIEW.getBoardLink(
        eventBoard.board_name,
        eventBoard.board_no,
        eventBoard.article_no,
      )}" target="_blank">${eventBoard?.title}</a>`;
      layerCont.append(`<div class="board">${urlHTML}</div>`);
    }

    if (!eventUrl == '' || !eventUrl == undefined) {
      const newUrl = eventUrl.includes('http://') || eventUrl.includes('https://') ? eventUrl : 'http://' + eventUrl;
      let urlHTML = `<a href="${newUrl}" target="_blank">${eventUrl}</a>`;
      layerCont.append(`<div class="url">${urlHTML}</div>`);
    }

    if (!eventDesc == '' || !eventDesc == undefined) {
      layerCont.append(`<div class="description">${eventDesc}</div>`);
    }
  },

  /**
   * 모바일 상세정보 팝업
   * @param eventId
   * @param currentDate
   */
  showDetail: async function (eventId, currentDate) {
    const event = [...CAC_VIEW.eventList, ...CAC_VIEW.promotion_data, ...CAC_VIEW.season_data].find(
      (item) => item._id === parseInt(eventId) || item._id === eventId,
    );

    CAC$('.calendar_view', CAC.getRoot()).css('display', 'none');
    CAC$('#layerAllEvent', CAC.getRoot()).css('display', 'none');
    CAC$('#mobile_search_calendar_head', CAC.getRoot()).css('display', 'none');
    CAC$('.dimed', CAC.getRoot()).css('display', 'none');

    // calendar_header
    const detailEl = CAC$('#calendar_header', CAC.getRoot());
    CAC$('#calendar_header .calendar_head', CAC.getRoot()).css('display', 'block');
    detailEl.css('display', 'block');

    // <h1 class="title">2024-04-16</h1>
    detailEl.find('.calendar_head').find('.title').html(currentDate);
    const detailViewEl = detailEl.find('.detail_view');

    if (!event.is_promotion) {
      CAC_VIEW.renderThirdPartyCalGroups(
        detailViewEl,
        event?.calendar_group_id || '',
        event._id || '',
        event.title,
        event.start_datetime || '',
        event.end_datetime || '',
        '',
        event.is_day || 'F',
      );
    } else {
      detailViewEl.find('.calendar_groups').html('');
    }

    const detailTitle = detailViewEl.find('.title').find('h1');
    const detailDate = detailViewEl.find('.cont').find('.date');
    const detailDesc = detailViewEl.find('.cont').find('.description');
    const detailUrl = detailViewEl.find('.cont').find('.url');
    const detailBoard = detailViewEl.find('.cont').find('.board');
    const detailImage = detailViewEl.find('.cont').find('.image');
    const detailCategories = detailViewEl.find('.cont').find('.categories');

    // reset
    detailTitle.html('');
    detailDate.html('');
    detailDesc.html('');
    detailUrl.html('');
    detailBoard.html('');
    detailImage.html('');
    detailCategories.html('');

    detailTitle.text(event.title);
    if (event.is_day === 'T') {
      const showDateTimeText = !event.end_datetime
        ? moment(event.start_datetime).format('YYYY-MM-DD')
        : `${moment(event.start_datetime).format('YYYY-MM-DD')} ~ ${moment(event.end_datetime).format('YYYY-MM-DD')}`;
      detailDate.html(showDateTimeText);
    } else {
      detailDate.html(
        `${moment(event.start_datetime).format('YYYY-MM-DD HH:mm')} ~ ${moment(event.end_datetime).format('YYYY-MM-DD HH:mm')}`,
      );
    }

    // 연관상품
    let imageHtml = '';
    if ('link_products' in event && event.link_products.length > 0) {
      for (const item of event.link_products) {
        const productHTML = await this.renderProductDetailView(item);
        if (productHTML) {
          imageHtml += productHTML;
        }
      }
    }

    if (!imageHtml) {
      detailImage.css('display', 'none');
    } else {
      detailImage.html(`<ul>${imageHtml}</ul>`);
      detailImage.css('display', 'block');
    }

    const eventCategories = event?.link_categories;
    if (eventCategories && eventCategories.length > 0) {
      const categoriesHTML = this.generateCategoriesHTML(eventCategories, (html) => `<ul>${html}</ul>`);
      if (!!categoriesHTML) {
        detailCategories.html(categoriesHTML);
        detailCategories.css('display', 'block');
      } else {
        detailCategories.css('display', 'none');
      }
    }

    if (!!event?.external_link_url) {
      const newUrl =
        event?.external_link_url.includes('http://') || event?.external_link_url.includes('https://')
          ? event?.external_link_url
          : 'http://' + event?.external_link_url;

      const urlHTML = `<a href="${newUrl}" target="_blank">${event.external_link_url}</a>`;
      detailUrl.css('display', 'block');
      detailUrl.html(urlHTML);
    } else {
      detailUrl.css('display', 'none');
    }

    if (typeof event?.link_board_article === 'object' && Object.keys(event?.link_board_article).length > 0) {
      let urlHTML = `<a href="${CAC_VIEW.getBoardLink(
        event?.link_board_article?.board_name,
        event?.link_board_article?.board_no,
        event?.link_board_article?.article_no,
      )}" target="_blank">${event?.link_board_article?.title}</a>`;
      detailBoard.css('display', 'block');
      detailBoard.html(urlHTML);
    } else {
      detailBoard.css('display', 'none');
    }

    if (!!event?.description) {
      detailDesc.html(event?.description);
      detailDesc.css('display', 'block');
    } else {
      detailDesc.css('display', 'none');
    }
  },

  /**
   * 상세정보 팝업 닫기
   */
  backToCalendar: function () {
    CAC_VIEW.removeDimed();

    CAC$('.calendar_view', CAC.getRoot()).css('display', 'block');
    if (CAC_UTIL.isMobile()) {
      if (CAC$('#calSearchMobile', CAC.getRoot()).css('display') === 'block') {
        CAC$('.calendar_head', CAC.getRoot()).css('display', 'block');
        CAC_VIEW.renderSearchCalendar();
      } else {
        CAC$('.calendar_head', CAC.getRoot()).css('display', 'none');
        CAC_VIEW.renderCalendarMobile();
      }
    }
    CAC$('#calendar_header', CAC.getRoot()).css('display', 'none');
  },

  /**
   * 모바일 검색 뷰 설정
   * @param isSearchView
   */
  setSearchView: function (isSearchView = true) {
    if (CAC_UTIL.isMobile()) {
      const shadowRoot = CAC.getRoot();

      // 검색했을시
      if (isSearchView) {
        CAC$('#calendar_wrap #mobile_search_calendar_head', shadowRoot).css('display', 'block');
        CAC$('#calSearchMobile', shadowRoot).css('display', 'block');

        //calendar_view add class search
        CAC$('.calendar_view', shadowRoot).addClass('search');

        // calendar_search
        CAC$('.calendar_view .calendar_search', shadowRoot).css('display', 'none');
        CAC$('.calendar_view .calendar_filter', shadowRoot).css('display', 'none');

        this.renderSearchCalendar();

        // 검색시 초기값 설정
        CAC_VIEW.calendar.getEvents().forEach((event) => {
          event.setProp('display', 'none');
        });
      } else {
        //calendar_view remove class search
        CAC$('.calendar_view', shadowRoot).removeClass('search');

        // calendar_search
        CAC$('.calendar_view .calendar_search', shadowRoot).css('display', 'block');
        CAC$('.calendar_view .calendar_filter', shadowRoot).css('display', 'block');

        CAC$('#calendar_wrap #mobile_search_calendar_head', shadowRoot).css('display', 'none');
        CAC$('#calSearchMobile', shadowRoot).css('display', 'none');

        this.renderCalendarMobile();
      }
    }
  },
  /**
   * 모바일 캘린더 검색
   */
  mobileSearchEvent: function () {
    CAC$('#calSearchMobile .inputbox', CAC.getRoot()).on('keyup', function () {
      let searchVal = CAC$(this).val();

      // filter event
      if (searchVal === '') {
        return;
      }

      // search event
      CAC_VIEW.debounceSearch(searchVal);
    });
  },

  closeMobileSearch: async function () {
    // 취소시 이벤트 초기화
    CAC$('#calSearchMobile .inputbox', CAC.getRoot()).val('');
    CAC_VIEW.setSearchView(false);
  },

  // 팝업 공통
  openLayer: function (IdName) {
    CAC_VIEW.removeDimed();
    CAC$('.layer_popup', CAC.getRoot()).css('display', 'none');
    if (CAC$('#calendar_wrap', CAC.getRoot()).hasClass('mobile')) {
      CAC_VIEW.appendDimed();
    }
    CAC$('#' + IdName, CAC.getRoot()).css('display', 'block');
  },
  closeLayer: function (IdName) {
    CAC_VIEW.removeDimed();
    CAC$('#' + IdName, CAC.getRoot()).css('display', 'none');
  },
  appendDimed: function (target) {
    CAC$('#calendar_wrap', CAC.getRoot()).append('<div class="dimed"></div>');
    CAC$('.dimed', CAC.getRoot()).css('display', 'block');
    CAC$('.dimed', CAC.getRoot()).on('click', function () {
      CAC$('.layer_popup', CAC.getRoot()).css('display', 'none');
      CAC_VIEW.removeDimed();
    });
  },
  removeDimed: function () {
    CAC$('.dimed', CAC.getRoot()).remove();
  },
  handleCheckCalendarGroupDisplay: function () {
    if (CAC_VIEW.calendarGroupList.length === 0) {
      return;
    }
    CAC_VIEW.openLayer('layerCalendarList');
  },

  renderProductDetailView: async function (product) {
    const cafe24Product = await CAC_CAFE24API.getProducts(product.product_no);
    if (!cafe24Product) return;
    //if(product.display === 'F') continue;

    const itemNames = product.items.map((item) => item.item_name).join(', ');
    const itemName = itemNames.length > 0 ? `(${itemNames})` : '';

    const soldOutHtml = cafe24Product?.sold_out === 'T' ? '<span class="soldout">SOLD OUT</span>' : '';
    return `<li class="first">
      <a href="/product/detail.html?product_no=${product.product_no}" title="${product.product_name} ${itemName}" target="_blank">
        <img src="${product.image}" alt="${product.product_name} ${itemName}">
        ${soldOutHtml}
      </a>
    </li>`;
  },
  generateCategoriesHTML: function (eventCategories, wrapperFn = null) {
    if (!eventCategories || eventCategories.length === 0) return '';

    const categoriesHTML = eventCategories
      .map(
        (item) => `
      <li class="first">
        <a href="/shop${CAFE24API.SHOP_NO}/category/${item.category_name}/${item.category_no}/" target="_blank">
          <span class="name">${item.category_name}</span>
        </a>
      </li>
    `,
      )
      .join('');

    // 기본 래퍼 함수
    const defaultWrapper = (html) => `<div class="categories"><ul>${html}</ul></div>`;

    // wrapperFn이 제공되면 사용하고, 아니면 기본 래퍼 사용
    return categoriesHTML ? (wrapperFn || defaultWrapper)(categoriesHTML) : '';
  },
  getBoardLink: function (board_name, board_no, article_no) {
    return `/shop${CAFE24API.SHOP_NO}/article/${board_name}/${board_no}/${article_no}/`;
  },

  THIRD_PARTY_CALENDARS: [
    {
      name: 'google',
      title: '구글 캘린더로 일정 가져가기',
      url: 'https://calendar.google.com/calendar/u/0/r/eventedit?details={description}&text={title}&dates={start_datetime}/{end_datetime}',
    },
  ],
  renderThirdPartyCalGroups: function (
    layer,
    calendarGroupId,
    calendarId,
    title,
    start_datetime,
    end_datetime,
    description = '',
    allDay,
  ) {
    const isUseThirdPartyCal = this.checkUseThirdPartyCal();
    if (!isUseThirdPartyCal) {
      return;
    }
    const layerGroups = layer.find('.calendar_groups');
    const style = CAC_UTIL.isMobile() ? 'width: 24px; height: 24px;' : 'width: 30px; height: 30px;';
    layerGroups.empty();
    this.THIRD_PARTY_CALENDARS.forEach((target) => {
      layerGroups.append(`<a href="javascript:void(0)" title="${target.title}" onclick="CAC_VIEW.handleThirdPartyCalClick('${target.name}', '${calendarGroupId}', '${calendarId}', '${title}', '${start_datetime}', '${end_datetime}', '${description}', '${allDay}')"><img src="/calendar/app/img/ico_calendar_${target.name}.png" style="${style}" alt="${target.title}" /></a>`);
    });
  },

  // 고객 캘린더 연동 여부 확인
  checkUseThirdPartyCal: function () {
    if (!!this.group_id) {
      const group = this.calendarGroupList.find((group) => group._id === this.group_id);
      return group && group.single_calendar_use_third_party_cal === 'T';
    } else {
      return this.basic_setting?.use_third_party_cal === 'T';
    }
  },

  handleThirdPartyCalClick: function (
    targetName,
    calendarGroupId,
    calendarId,
    title,
    start_datetime,
    end_datetime,
    description,
    allDay,
  ) {
    const target = this.THIRD_PARTY_CALENDARS.find((target) => target.name === targetName);
    const url = target.url
      .replace('{title}', encodeURIComponent(title))
      .replace(
        '{start_datetime}',
        start_datetime
          ? allDay === 'F'
            ? encodeURIComponent(moment(start_datetime).format('YYYYMMDDTHHmmssZ'))
            : encodeURIComponent(moment(start_datetime).format('YYYYMMDD'))
          : '',
      )
      .replace(
        '{end_datetime}',
        end_datetime
          ? allDay === 'F'
            ? encodeURIComponent(moment(end_datetime).format('YYYYMMDDTHHmmssZ'))
            : encodeURIComponent(moment(end_datetime).add(1, 'day').format('YYYYMMDD'))
          : '',
      )
      .replace('{description}', '');
    CAC_DATA.updateThirdPartyCalClickCount(calendarGroupId, calendarId, targetName);
    window.open(url, '_blank');
  },

  decodeHTMLEntities: function (text) {
    return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  },
};
