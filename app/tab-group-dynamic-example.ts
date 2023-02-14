import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as Survey from 'survey-angular';
import * as ko from 'survey-knockout';

/**
 * @title Tab group with dynamically changing tabs
 */
@Component({
  selector: 'tab-group-dynamic-example',
  templateUrl: 'tab-group-dynamic-example.html',
  styleUrls: ['tab-group-dynamic-example.scss'],
})
export class TabGroupDynamicExample {


  constructor() {
    // this.initData();
    // this.initSurvey();
  }

  ngOnInit() {
    this.initData();
    this.initSurvey();
  }

  tabs = [];
  selected = new FormControl(0);
  selectedIndex: number;
  surveyModel: any;
  json;
  isTabVisible = true;
  navClass = 'mat-tab-label';
  page;
  mode;

  initSurvey() {
    var survey = new Survey.Model(this.json);

    // survey.mode = 'display';
    // survey.isSinglePage = true;

    this.surveyModel = survey;
    var pageCount = this.surveyModel.pages.length;
    for (var i = 0; i < pageCount; i++) {
      if (i == 0) {
        this.tabs.push(
          {
            "index": i,
            "name": this.surveyModel.pages[i].name,
            "selected": true,
            "pageErrorCount": 0,
            "isErrorVisible": false
          });

      } else {
        this.tabs.push(
          {
            "index": i,
            "name": this.surveyModel.pages[i].name,
            "selected": false,
            "pageErrorCount": 0,
            "isErrorVisible": false
          });
      }
    }

    survey.render("surveyElement");

    survey.onCurrentPageChanged.add(result => {
      console.log("onCurrentPageChanged");
      this.selectedIndex = this.surveyModel.currentPageNo;

      console.log("Nav JSON values", survey.getPropertyValue("navjson"));
      if (survey.getPropertyValue("navjson") != null) {
        this.tabs = survey.getPropertyValue("navjson");
      }
      console.log("this.tabs-------------------", this.tabs);
      for (var i = 0; i < this.tabs.length; i++) {
        if (this.selectedIndex == i) {
          console.log("Inside true")
          this.tabs[i].selected = true;
        } else {
          console.log("Inside false")
          this.tabs[i].selected = false;
        }
      }
    });

    survey.onComplete
      .add(result => {
        var data = result.data;
        console.log("onComplete called");
        this.isTabVisible = false;
      });

    survey.onCompleting.add(function (sender, options) {
      // var localJson = this.json;
      // console.log("Locale JSON", localJson);
      console.log("Locale sender", sender);
      console.log("onCompleting called");
      //if (!!survey.isConfirming) return;

      // let errorPageIndex: number;
      // for (var i = 0; i < survey.getAllQuestions().length; i++) {
      //   let question: any = survey.getAllQuestions()[i];
      //   if (question.hasErrors()) {
      //     console.log("question name -------->", question.page.name);
      //     for (var i = 0; i < survey.pages.length; i++) {
      //       if (question.page.name === survey.pages[i].name) {
      //         console.log("Name matched ----------->");
      //         errorPageIndex = i;
      //         console.log("First Break ----------->");
      //         break;
      //       }
      //     }
      //   }
      //   if (errorPageIndex != null) {
      //     console.log("Second Break ----------->");
      //     break;
      //   }
      // }

      let errorPageIndex;
      let pageErrorCount;
      let isErrorPageCountVisible;
      let pageName;
      let localTabs = [];
      for (var i = 0; i < survey.pages.length; i++) {
        console.log("Survey Page Length", survey.pages.length);
        pageErrorCount = 0;
        pageName = survey.pages[i].name;
        console.log("pageName", pageName);
        let questions: any = survey.getAllQuestions();
        for (var j = 0; j < questions.length; j++) {
          console.log("Survey questions Length", questions.length);
          if (questions[j].hasErrors() && questions[j].page.name === pageName) {
            console.log("Error Found in Page", pageName);
            pageErrorCount = pageErrorCount + 1;
            console.log("Error count in Page", pageErrorCount);
            if (errorPageIndex == null) {
              errorPageIndex = i;
              console.log("Error Page Index initialised", errorPageIndex);
            }
          }
        }

        if (pageErrorCount != null && pageErrorCount > 0) {
          isErrorPageCountVisible = true;
        } else {
          isErrorPageCountVisible = false;
        }
        localTabs.push(
          {
            "index": i,
            "name": pageName,
            "selected": false,
            "pageErrorCount": pageErrorCount,
            "isErrorVisible": isErrorPageCountVisible
          });
      }

      if (errorPageIndex != null) {
        console.log("Prevent Survey from Completing", errorPageIndex);
        for (var i = 0; i < localTabs.length; i++) {
          if (errorPageIndex == i) {
            console.log("Inside true for index", localTabs[i])
            localTabs[i].selected = true;
          } else {
            console.log("Inside false for index", localTabs[i].selected)
            localTabs[i].selected = false;
          }
        }

        this.tabs = localTabs;
        console.log("Upated Json response", JSON.stringify(this.tabs));
        survey.setPropertyValue("navjson", localTabs);

        survey.isConfirming = false;
        options.allowComplete = false;
        survey.currentPageNo = errorPageIndex;
        survey.onCurrentPageChanged.fire(survey, options);
      }
    });
  }

  selectPage(nav) {
    console.log("selectPage");
    this.getActiveClass(nav.index);
    this.surveyModel.currentPageNo = nav.index;
  }


  getActiveClass(navIndex) {
    console.log("selectPage");
    this.navClass = 'mat-tab-label';
    if (this.selectedIndex === navIndex) {
      console.log("Inside Active class");
      this.navClass = 'mat-tab-label-active';
    }
  }

  data = [
    { label: 'Single', checked: false },
    { label: 'Multiple', checked: false },
    { label: 'Read', checked: true },
    { label: 'Edit', checked: false }
  ];

  onChange(event, index, item) {

    item.checked = !item.checked;
    console.log(item.label);

    if (item.label == "Single") {
      this.surveyModel.isSinglePage = true;
      console.log("Single");
    }
    else if (item.label == "Multiple") {
      this.surveyModel.isSinglePage = false;
      console.log("Multiple");
    }
    else if (item.label == "Read") {
      this.surveyModel.mode = 'display'
      console.log("Read");
    }
    else if (item.label == "Edit") {
      this.surveyModel.mode = 'edit'
      console.log("Edit");
    }
    this.surveyModel.render();
  }

  initData() {
    var json = {
      pages: [
        {
          name: "Business continuity Page1",
          questions: [
            {
              isRequired: true,
              type: "matrix",
              name: "Quality",
              title: "Please indicate if you agree or disagree with the following statements",
              columns: [
                {
                  value: 1,
                  text: "Strongly Disagree"
                }, {
                  value: 2,
                  text: "Disagree"
                }, {
                  value: 3,
                  text: "Neutral"
                }, {
                  value: 4,
                  text: "Agree"
                }, {
                  value: 5,
                  text: "Strongly Agree"
                }
              ],
              rows: [
                {
                  value: "affordable",
                  text: "Product is affordable"
                }, {
                  value: "does what it claims",
                  text: "Product does what it claims"
                }, {
                  value: "better then others",
                  text: "Product is better than other products on the market"
                }, {
                  value: "easy to use",
                  text: "Product is easy to use"
                }
              ]
            }, {
              type: "rating",
              name: "satisfaction",
              title: "How satisfied are you with the Product?",
              mininumRateDescription: "Not Satisfied",
              maximumRateDescription: "Completely satisfied"

            }, {
              type: "rating",
              name: "recommend friends",
              visibleIf: "{satisfaction} > 3",
              title: "How likely are you to recommend the Product to a friend or co-worker?",
              mininumRateDescription: "Will not recommend",
              maximumRateDescription: "I will recommend"

            }, {
              type: "comment",
              name: "suggestions",
              title: "What would make you more satisfied with the Product?"

            }
          ]
        }, {
          name: "Business continuity Page2",
          questions: [
            {
              type: "radiogroup",
              isRequired: true,
              name: "price to competitors",
              title: "Compared to our competitors, do you feel the Product is",
              choices: ["Less expensive", "Priced about the same", "More expensive", "Not sure"]
            }, {
              isRequired: true,
              type: "radiogroup",
              name: "price",
              title: "Do you feel our current price is merited by our product?",
              choices: ["correct|Yes, the price is about right", "low|No, the price is too low for your product", "high|No, the price is too high for your product"]

            }, {
              isRequired: true,
              type: "multipletext",
              name: "pricelimit",
              title: "What is the... ",
              items: [
                {
                  name: "mostamount",
                  title: "Most amount you would every pay for a product like ours"
                }, {
                  name: "leastamount",
                  title: "The least amount you would feel comfortable paying"
                }
              ]

            }
          ]
        }, {
          name: "Business continuity Page3",
          questions: [
            {

              type: "text",
              name: "email",
              title: "Thank you for taking our survey. Your survey is almost complete, please enter your email address and then press the 'Submit' button.",
              isRequired: true
            }
          ]
        },

        {
          name: "Business continuity Page4",
          questions: [
            {
              isRequired: true,
              type: "matrix",
              name: "Quality",
              title: "Please indicate if you agree or disagree with the following statements",
              columns: [
                {
                  value: 1,
                  text: "Strongly Disagree"
                }, {
                  value: 2,
                  text: "Disagree"
                }, {
                  value: 3,
                  text: "Neutral"
                }, {
                  value: 4,
                  text: "Agree"
                }, {
                  value: 5,
                  text: "Strongly Agree"
                }
              ],
              rows: [
                {
                  value: "affordable",
                  text: "Product is affordable"
                }, {
                  value: "does what it claims",
                  text: "Product does what it claims"
                }, {
                  value: "better then others",
                  text: "Product is better than other products on the market"
                }, {
                  value: "easy to use",
                  text: "Product is easy to use"
                }
              ]
            }, {
              type: "rating",
              name: "satisfaction",
              title: "How satisfied are you with the Product?",
              mininumRateDescription: "Not Satisfied",
              maximumRateDescription: "Completely satisfied"

            }, {
              type: "rating",
              name: "recommend friends",
              visibleIf: "{satisfaction} > 3",
              title: "How likely are you to recommend the Product to a friend or co-worker?",
              mininumRateDescription: "Will not recommend",
              maximumRateDescription: "I will recommend",
              isRequired: true
            }, {
              type: "comment",
              name: "suggestions",
              title: "What would make you more satisfied with the Product?",
              isRequired: true
            }
          ]
        }
      ]
    }
    this.json = json;
  }
}
