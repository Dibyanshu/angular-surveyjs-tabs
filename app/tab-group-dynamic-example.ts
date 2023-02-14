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
ansJson: string = '{"productGroup":"breadBakeryProducts","intensityFactor":"kgCO2eProduct","intensityFactorScope1-2Kg":0.3,"methodologyUsedForEmissionsCalculations":"averageDataMethod","categoriesIncludedInScope3":["capitalGoods"],"toolsAndPlatformsUsedForEmissionsCalculation":["excelSheetForScope1-2CalculationExcel sheet for Scope 1 & 2 calculation"],"emissionReductionTargetsScope1-2":"yesAbsoluteTarget","targetsApprovedBySBTi":"yes","netZeroTargets":"yes"}';


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
      "title": {
       "default": "Ahold Delhaize GHG emission reporting 2022",
       "cs": "Výkaz skleníkových emisí pro Ahold Delhaize, respektive Albert Česká republika 2022"
      },
      "logoPosition": "right",
      "pages": [
       {
        "name": "introduction",
        "elements": [
         {
          "type": "html",
          "name": "welcomeToAholdDelhaizeGHGReporting",
          "html": {
           "default": "<h2>Welcome to the Ahold Delhaize GreenHouse Gas reporting</h2>\n\n<p>Climate change is impacting how food is grown and will change our business in the future. Ahold Delhaize is committed to supporting the well-being of the communities we serve and enabling a healthy, low-carbon food system that secures healthy and sustainable diets for future generations. In line with the latest climate science to limit global warming, we are committed to reducing carbon emissions across our value chain. Therefore we ask you, our supplier to join us in our mission and to report out on your GreenHouse Gas emission via this reporting template or via CDP.</p>",
           "cs": "<h2>Vítejte v reportovacím dotazníku skleníkových plynů<h2><p>Klimatická změna má nejen vliv na produkci našich potravin, ale také na náš business. Společnost Ahold Delhaize, respektive Albert Česká republika se zavázala podporovat blaho našich zákazníků, a to především v podpoře zdravého a nízkouhlíkového potravinového systému, který zajistí zdravou a udržitelnou stravu pro budoucí generace. V souladu s posledními výzkumy v oblasti globálního oteplování jsme se jako společnost zavázali snížit naše emise i v rámci našeho dodavatelského řetězce. Proto vás, naše dodavatele, žádáme, abyste se k nám v naší misi připojili a nahlásili nám vaše emise skleníkových plynů prostřednictvím tohoto reportovacího dotazníku nebo prostřednictvím mezinárodní platformy CDP.</p>"
          }
         },
         {
          "type": "html",
          "name": "deadline",
          "html": {
           "default": "<h3>Deadline</h3>\n\n<p>THE DEADLINE FOR FILLING IN THE FORM IS <strong>June 1st, 2023</strong>.</p>",
           "cs": "<h3>Termín</h3><p>TERMÍN PRO VYPLNĚNÍ DOTAZNÍKU JE<strong>1. června 2023</strong>.</p>"
          }
         },
         {
          "type": "html",
          "name": "scopeOfReporting",
          "html": {
           "default": "<h3>Scope of reporting</h3>\n\n<p>The scope of this reporting template is everything sold by Ahold Delhaize Brands, either direct or indirect, cradle to gate. The targets that we ask for are short-term targets, so up to 2030.</p>",
           "cs": "<h3>Rozsah dotazníku</h3><p>Dotazník zahrnuje vše, co společnost Ahold Delhaize, respektive Albert Česká republika prodává, ať už přímo nebo nepřímo, od výroby po prodej. Cíle, které požadujeme, jsou krátkodobé cíle, tedy do roku 2030.</p>"
          }
         },
         {
          "type": "html",
          "name": "multipleAholdDelhaizeBrands",
          "html": {
           "default": "<h3>Multiple Ahold Delhaize brands</h3>\n\n<p>For suppliers who provide products to multiple Ahold Delhaize European Brands: Please fill out the report in English including all the Brand specific information, in the same report (no need for duplication).</p>",
           "cs": "<h3>Vícero značek Ahold Delhaize</h3><p>Dodavatelé pro vícero značek Ahold Delhaize: Prosíme o vyplnění dotazníku v angličtině včetně všech informací specifických pro jednotlivé značky v jednom dotazníku (netřeba duplikace).</p>"
          }
         },
         {
          "type": "html",
          "name": "guidanceAndQuestions",
          "html": {
           "default": "<h3>Guidance and questions</h3>\n\n<ul>\n\t<li>If a question is not clear, please check the Ahold Delhaize Scope 3 guidebook.</li>\n\t<li>If the question is still not clear, please leave the question blank, and share your thoughts in the 'Closing' section of the questionnaire.</li>\n\t<li>If you run into a required question that you can not answer, please contact your GHG contact person at the Brand.</li>\n\t<li>The reporting period always has to be 12 months, if you have a split reporting year, the majority of the reporting period should be in the reporting year.</li>\n</ul>",
           "cs": "<h3>Postup a otázky</h3><ul>\t<li>V případě, že je vám otázka nejasná, obratťe se na \"Ahold Delhaize Scope 3 guidebook\".</li>\t<li>V případě, že by vám otázka byla i nadále nejasná, ponechte odpověď prázdnou a využijte prostor ke komentování na konci dotazníku.</li>\t<li>V případě, že nebudete schopni na otázku odpovědět, kontaktujte kompetentní osobu v Ahold Delhaize, respektive v Albertu Česká republika.</li>\t<li>Vykazované období musí být vždy 12 měsíců, pokud máte rozdělený rok vykazování, většina vykazovaného období by měla být ve vykazovaném roce.</li></ul>"
          }
         },
         {
          "type": "html",
          "name": "changesAndMissingInformation",
          "html": {
           "default": "<h3>Changes and missing information</h3>\n\n<p>Please keep in mind that consistency is important. If you added a subsidiary to the reporting scope or anything that could create a (significant) difference in the total emission of the products that you supply to us, please let us know at the 'Closing' section of the questionnaire.</p>",
           "cs": "<h3>Změny a chybějící informace</h3><p>Mějte prosím na paměti, že důslednost je důležitá. Pokud jste do rozsahu reportování přidali dceřinou společnost nebo cokoli, co by mohlo způsobit (významný) rozdíl v celkových emisích produktů, které nám dodáváte, dejte nám prosím vědět v závěrečné části dotazníku.</p>"
          }
         },
         {
          "type": "panel",
          "name": "companyDetails",
          "elements": [
           {
            "type": "text",
            "name": "companyName",
            "title": {
             "default": "Company name",
             "cs": "Název společnosti"
            },
            "description": {
             "default": "Please state your company name",
             "cs": "Uveďte, prosím, název vaší společnosti"
            },
            "isRequired": true
           },
           {
            "type": "matrixdynamic",
            "name": "subsidiaries",
            "title": {
             "default": "Subsidiaries (multiple entries)",
             "cs": "Dceřiné společnosti (více možností)"
            },
            "description": {
             "default": "Please state the subsidiary/-ies that belong to your company and provide products to Ahold Delhaize Brands",
             "cs": "Uveďte, prosím, dceřiné společnosti, které patří vaší společnosti a dodávají produkty společnosti Ahold Delhaize, respektive Albert Česká republika"
            },
            "isRequired": true,
            "showHeader": false,
            "columns": [
             {
              "name": "subsidiaryName",
              "title": {
               "default": "Subsidiary name",
               "cs": "Název dceřiné společnosti"
              },
              "cellType": "text"
             }
            ],
            "rowCount": 1,
            "maxRowCount": 50
           },
           {
            "type": "text",
            "name": "contactPersonCarbonEmissions",
            "title": {
             "default": "Contact person for carbon emissions",
             "cs": "Kontaktní osoba pro problematiku CO2"
            },
            "description": {
             "default": "Please provide a GHG contact person",
             "cs": "Uveďte, prosím, kontaktní osobu zabývající se skleníkovými plyny"
            },
            "isRequired": true
           },
           {
            "type": "text",
            "name": "contactPersonEmailCarbonEmissions",
            "title": {
             "default": "Email address of contact person",
             "cs": "Emailová adresa kontaktní osoby pro problematiku CO2"
            },
            "description": {
             "default": "Please state the email address of the GHG contact person",
             "cs": "Uveďte, prosím, email kontaktní osoby zabývající se skleníkovými plyny"
            },
            "isRequired": true,
            "inputType": "email"
           }
          ],
          "title": {
           "default": "Company details",
           "cs": "Údaje o společnosti"
          }
         }
        ],
        "title": {
         "default": "Introduction",
         "cs": "Úvod"
        }
       },
       {
        "name": "emissionTargetsScope1-2",
        "elements": [
         {
          "type": "html",
          "name": "emissionTargetsExplanation",
          "html": {
           "default": "<p>Ahold Delhaize encourages their suppliers to set emission reduction targets. These emission reduction targets do not have to be approved by a third party, as long as they are official and publicly available.</p>\n\n<p>In developing your climate targets, try to align with the Science Based Targets (Net-Zero Standard) using their manual: <a href=\"https://sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf\">sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf</a>.</p>\n",
           "cs": "<p>Albert Česká republika povzbuzuje své dodavatele, aby si stanovili redukční emisní cíle. Tyto cíle nemusejí být schváleny třetí stranou v případě, že jsou oficiálně vyhlášeny a veřejně dostupné.</p><p>Při stanovení vašich klimatických cílů buďte, prosím, být v souladu se \"Science Based Targets (Net-Zero Standard)\", více v jejich manuálu: <a href=\"https://sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf\">sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf</a>.</p>"
          }
         },
         {
          "type": "radiogroup",
          "name": "emissionReductionTargetsScope1-2",
          "title": {
           "default": "Does your company have emission reduction targets for scope 1 & 2?",
           "cs": "Má vaše společnost nastavené cíle v oblasti redukce emisí kategorie 1 a 2?"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "yesAbsoluteTarget",
            "text": {
             "default": "Yes, we published an absolute target (i.e. of total carbon emissions)",
             "cs": "Ano, absolutní cíl"
            }
           },
           {
            "value": "yesIntensityTarget",
            "text": {
             "default": "Yes, we published an intensity target (i.e. of relative carbon emissions per kg, per euro, or other unit)",
             "cs": "Ano, cíl intenzity"
            }
           },
           {
            "value": "yesNotPublishedAbsoluteTarget",
            "text": {
             "default": "Yes, we have and absolute target, but not published",
             "cs": "Ano, máme stanovený absolutní cíl, ale zatím není zveřejněný"
            }
           },
           {
            "value": "yesNotPublishedIntensityTarget",
            "text": {
             "default": "Yes, we have an intensity target, but not published",
             "cs": "Ano, máme stanovený cíl intenzity, ale zatím není zveřejněný"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           }
          ]
         },
         {
          "type": "panel",
          "name": "absoluteTargetScope1-2",
          "elements": [
           {
            "type": "html",
            "name": "absoluteTargetExplanationScope1-2",
            "html": {
             "default": "<p>Absolute target: An overall reduction in the amount of GHGs emitted to the atmosphere by the target year, relative to the base year.</p>\n\n<p>Example: AD commits to reduce absolute scope 1 and 2 GHG emissions 50% by FY2030 from a FY2018 base-year. </p>",
             "cs": "<p>Absolutní cíl: Celkové snížení množství skleníkových plynů emitovaných do atmosféry v cílovém roce ve srovnání s rokem základním.</p><p>Příklad: Ahold Delhaize se zavázal zredukovat absolutní rozsah emisí skleníkových plynů kategorií 1 a 2 o 50% do fiskálního roku 2030 oproti fiskálnímu základnímu roku 2018.</p>"
            }
           },
           {
            "type": "dropdown",
            "name": "asboluteTargetBaselineYearScope1-2",
            "title": {
             "default": "What is your baseline year for scope 1 & 2?",
             "cs": "Jaký je váš výchozí rok pro kategorie 1 a 2?"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesAbsoluteTarget'",
            "choices": [
             {
              "value": "baselineYear2022",
              "text": "2022"
             },
             {
              "value": "baselineYear2021",
              "text": "2021"
             },
             {
              "value": "baselineYear2020",
              "text": "2020"
             },
             {
              "value": "baselineYear2019",
              "text": "2019"
             },
             {
              "value": "baselineYear2018",
              "text": "2018"
             },
             {
              "value": "baselineYear2017",
              "text": "2017"
             },
             {
              "value": "baselineYear2016",
              "text": "2016"
             },
             {
              "value": "baselineYear2015",
              "text": "2015"
             }
            ],
            "showOtherItem": true,
            "otherText": {
             "default": "Earlier than 2015, namely...",
             "cs": "Dříve než rok 2015, konkrétněji…"
            }
           },
           {
            "type": "text",
            "name": "asboluteTargetGhgEmissionsInBaselineYearScope1-2",
            "title": {
             "default": "What were your GHG emissions in the baseline year for scope 1 & 2?",
             "cs": "Jaké byly vaše emise skleníkových plynů ve vašem výchozím roce pro kategorie 1 a 2?"
            },
            "description": {
             "default": " metric tonnes CO2e",
             "cs": "metrické tuny ekvivalentu CO2"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesAbsoluteTarget'",
            "inputType": "number",
            "autocomplete": "name",
            "inputMask": "decimal"
           },
           {
            "type": "dropdown",
            "name": "asboluteTargetTargetYearScope1-2",
            "title": {
             "default": "What is the near-term target year for scope 1 & 2?",
             "cs": "Jaký je váš nejbližší cílový rok pro kategorie 1 a 2?"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesAbsoluteTarget'",
            "choices": [
             {
              "value": "targetYear2023",
              "text": "2023"
             },
             {
              "value": "targetYear2024",
              "text": "2024"
             },
             {
              "value": "targetYear2025",
              "text": "2025"
             },
             {
              "value": "targetYear2026",
              "text": "2026"
             },
             {
              "value": "targetYear2027",
              "text": "2027"
             },
             {
              "value": "targetYear2028",
              "text": "2028"
             },
             {
              "value": "targetYear2029",
              "text": "2029"
             },
             {
              "value": "targetYear2030",
              "text": "2030"
             },
             {
              "value": "targetYear2031",
              "text": "2031"
             },
             {
              "value": "targetYear2032",
              "text": "2032"
             },
             {
              "value": "targetYear2033",
              "text": "2033"
             },
             {
              "value": "targetYear2034",
              "text": "2034"
             },
             {
              "value": "targetYear2035",
              "text": "2035"
             },
             {
              "value": "targetYear2036",
              "text": "2036"
             },
             {
              "value": "targetYear2037",
              "text": "2037"
             },
             {
              "value": "targetYear2038",
              "text": "2038"
             },
             {
              "value": "targetYear2039",
              "text": "2039"
             },
             {
              "value": "targetYear2040",
              "text": "2040"
             },
             {
              "value": "targetYear2041",
              "text": "2041"
             },
             {
              "value": "targetYear2042",
              "text": "2042"
             },
             {
              "value": "targetYear2043",
              "text": "2043"
             },
             {
              "value": "targetYear2044",
              "text": "2044"
             },
             {
              "value": "targetYear2045",
              "text": "2045"
             },
             {
              "value": "targetYear2046",
              "text": "2046"
             },
             {
              "value": "targetYear2047",
              "text": "2047"
             },
             {
              "value": "targetYear2048",
              "text": "2048"
             },
             {
              "value": "targetYear2049",
              "text": "2049"
             },
             {
              "value": "targetYear2050",
              "text": "2050"
             }
            ]
           },
           {
            "type": "text",
            "name": "asboluteTargetReductionTargetScope1-2",
            "title": {
             "default": "What is the reduction target for scope 1 & 2?",
             "cs": "Jaký je váš cíl pro snížení emisí kategorií 1 a 2?"
            },
            "description": {
             "default": "% percentage",
             "cs": "% procentuálně"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesAbsoluteTarget'",
            "inputType": "number",
            "min": 0,
            "max": 100,
            "step": 5,
            "inputMask": "decimal"
           }
          ],
          "visibleIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesNotPublishedAbsoluteTarget']",
          "title": {
           "default": "Absolute target for scope 1 & 2",
           "cs": "Absolutní cíl pro kategorie 1 a 2"
          }
         },
         {
          "type": "panel",
          "name": "intensityTargetScope1-2",
          "elements": [
           {
            "type": "html",
            "name": "intensityTargetExplanationScope1-2",
            "html": {
             "default": "<p>(Emissions) intensity target: a reduction in the amount of GHGs emitted to the atmosphere based on a <u>physical or economic metric</u>.</p>\n<p>Example: Manufacturer X commits to reduce scope 1 and\nscope 2 emissions 30% <u>per unit of value added</u> by 2020 from a 2015 base-year.</p>",
             "cs": "<p>(Emisní) cíl intensity: snížení množství skleníkových plynů emitovaných do atmosféry na základě <u>fyzické nebo ekonomické metriky</u>.</p><p>Příklad: Výrobce X se zavazuje omezit emise kategorií 1 a 2 o 30 % <u>na jednotku přidané hodnoty</u> do roku 2020 oproti základnímu roku 2015.</p>"
            }
           },
           {
            "type": "dropdown",
            "name": "intensityTargetBaselineYearScope1-2",
            "title": {
             "default": "What is your baseline year for scope 1 & 2?",
             "cs": "Jaký je váš výchozí rok pro kategorie 1 a 2?"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesIntensityTarget'",
            "choicesFromQuestion": "asboluteTargetBaselineYearScope1-d2",
            "choices": [
             {
              "value": "baselineYear2022",
              "text": "2022"
             },
             {
              "value": "baselineYear2021",
              "text": "2021"
             },
             {
              "value": "baselineYear2020",
              "text": "2020"
             },
             {
              "value": "baselineYear2019",
              "text": "2019"
             },
             {
              "value": "baselineYear2018",
              "text": "2018"
             },
             {
              "value": "baselineYear2017",
              "text": "2017"
             },
             {
              "value": "baselineYear2016",
              "text": "2016"
             },
             {
              "value": "baselineYear2015",
              "text": "2015"
             }
            ],
            "showOtherItem": true,
            "otherText": {
             "default": "Earlier than 2015, namely...",
             "cs": "Dříve než rok 2015, konkrétněji…"
            }
           },
           {
            "type": "text",
            "name": "intensityTargetGhgEmissionsInBaselineYearScope1-2",
            "title": {
             "default": "What were your GHG emissions in the baseline year for scope 1 & 2?",
             "cs": "Jaké byly vaše emise skleníkových plynů ve vašem výchozím roce pro kategorie 1 a 2?"
            },
            "description": {
             "default": " metric tonnes CO2e",
             "cs": "metrické tuny ekvivalentu CO2"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesIntensityTarget'",
            "inputType": "number",
            "inputMask": "decimal"
           },
           {
            "type": "dropdown",
            "name": "intensityTargetNearTermTargetYearScope1-2",
            "title": {
             "default": "What is the near-term target year for scope 1 & 2?",
             "cs": "Jaký je váš nejbližší cílový rok pro kategorie 1 a 2?"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesIntensityTarget'",
            "choices": [
             {
              "value": "targetYear2023",
              "text": "2023"
             },
             {
              "value": "targetYear2024",
              "text": "2024"
             },
             {
              "value": "targetYear2025",
              "text": "2025"
             },
             {
              "value": "targetYear2026",
              "text": "2026"
             },
             {
              "value": "targetYear2027",
              "text": "2027"
             },
             {
              "value": "targetYear2028",
              "text": "2028"
             },
             {
              "value": "targetYear2029",
              "text": "2029"
             },
             {
              "value": "targetYear2030",
              "text": "2030"
             },
             {
              "value": "targetYear2031",
              "text": "2031"
             },
             {
              "value": "targetYear2032",
              "text": "2032"
             },
             {
              "value": "targetYear2033",
              "text": "2033"
             },
             {
              "value": "targetYear2034",
              "text": "2034"
             },
             {
              "value": "targetYear2035",
              "text": "2035"
             },
             {
              "value": "targetYear2036",
              "text": "2036"
             },
             {
              "value": "targetYear2037",
              "text": "2037"
             },
             {
              "value": "targetYear2038",
              "text": "2038"
             },
             {
              "value": "targetYear2039",
              "text": "2039"
             },
             {
              "value": "targetYear2040",
              "text": "2040"
             },
             {
              "value": "targetYear2041",
              "text": "2041"
             },
             {
              "value": "targetYear2042",
              "text": "2042"
             },
             {
              "value": "targetYear2043",
              "text": "2043"
             },
             {
              "value": "targetYear2044",
              "text": "2044"
             },
             {
              "value": "targetYear2045",
              "text": "2045"
             },
             {
              "value": "targetYear2046",
              "text": "2046"
             },
             {
              "value": "targetYear2047",
              "text": "2047"
             },
             {
              "value": "targetYear2048",
              "text": "2048"
             },
             {
              "value": "targetYear2049",
              "text": "2049"
             },
             {
              "value": "targetYear2050",
              "text": "2050"
             }
            ]
           },
           {
            "type": "text",
            "name": "intensityTargetReductionTargetScope1-2",
            "title": {
             "default": "What is the reduction target for scope 1 & 2?",
             "cs": "Jaký je váš cíl pro snížení emisí kategorií 1 a 2?"
            },
            "description": {
             "default": "% percentage",
             "cs": "% procentuálně"
            },
            "requiredIf": "{emissionReductionTargetsScope1-2} = 'yesIntensityTarget'",
            "inputType": "number",
            "min": 0,
            "max": 100,
            "step": 5,
            "inputMask": "decimal"
           }
          ],
          "visibleIf": "{emissionReductionTargetsScope1-2} anyof ['yesIntensityTarget', 'yesNotPublishedIntensityTarget']",
          "title": {
           "default": "Intensity target for scope 1 & 2",
           "cs": "Cíl intenzity pro kategorie 1 a 2"
          }
         },
         {
          "type": "comment",
          "name": "reductionPlanScope1-2",
          "visibleIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesIntensityTarget', 'yesNotPublishedAbsoluteTarget', 'yesNotPublishedIntensityTarget']",
          "title": {
           "default": "Can you share your plan how the reduction target on scope 1 & 2 will be realized?",
           "cs": "Jak budete snížení emisí kategorií 1 a 2 realizovat?"
          },
          "description": {
           "default": "Please include at least the reduction actions/ measures, the expected impact and the year of realization for the biggest reductions.",
           "cs": "Uveďte, prosím, alespoň redukční činy/opatření, očekávaný dopad a rok realizace u největších snížení."
          },
          "requiredIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesIntensityTarget', 'yesNotPublishedAbsoluteTarget', 'yesNotPublishedIntensityTarget']"
         }
        ],
        "title": {
         "default": "Emission targets: Scope 1 & 2",
         "cs": "Emisní cíle: Kategorie 1 a 2"
        }
       },
       {
        "name": "emissionTargetsScope3",
        "elements": [
         {
          "type": "html",
          "name": "emissionTargetsExplanationScope3",
          "html": {
           "default": "<p>Ahold Delhaize encourages their suppliers to set emission reduction targets. These emission reduction targets do not have to be approved by a third party, as long as they are official and publicly available.</p>\n\n<p>In developing your climate targets, try to align with the Science Based Targets (Net-Zero Standard) using their manual: <a href=\"https://sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf\">sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf</a>.</p>",
           "cs": "<p>Albert Česká republika povzbuzuje své dodavatele, aby si stanovili redukční emisní cíle. Tyto cíle nemusejí být schváleny třetí stranou v případě, že jsou oficiálně vyhlášeny a veřejně dostupné.</p><p>Při stanovení vašich klimatických cílů zkuste být v souladu se \"Science Based Targets (Net-Zero Standard)\", více v jejich manuálu: <a href=\"https://sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf\">sciencebasedtargets.org/resources/legacy/2017/04/SBTi-manual.pdf</a>.</p>"
          }
         },
         {
          "type": "radiogroup",
          "name": "emissionReductionTargetsScope3",
          "title": {
           "default": "Does your company have emission reduction targets for scope 3?",
           "cs": "Má vaše společnost nastavené cíle v oblasti redukce emisí kategorie 3?"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "yesAbsoluteTarget",
            "text": {
             "default": "Yes, we published an absolute target (i.e. of total carbon emissions)",
             "cs": "Ano, absolutní cíl"
            }
           },
           {
            "value": "yesIntensityTarget",
            "text": {
             "default": "Yes, we published an intensity target (i.e. of relative carbon emissions per kg, per euro, or other unit)",
             "cs": "Ano, cíl intenzity"
            }
           },
           {
            "value": "yesNotPublishedAbsoluteTarget",
            "text": {
             "default": "Yes, we have and absolute target, but not published",
             "cs": "Ano, máme stanovený absolutní cíl, ale zatím není zveřejněný"
            }
           },
           {
            "value": "yesNotPublishedIntensityTarget",
            "text": {
             "default": "Yes, we have an intensity target, but not published",
             "cs": "Ano, máme stanovený cíl intenzity, ale zatím není zveřejněný"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           }
          ]
         },
         {
          "type": "panel",
          "name": "asboluteTargetScope3",
          "elements": [
           {
            "type": "dropdown",
            "name": "asboluteTargetBaselineYearScope3",
            "title": {
             "default": "What is your baseline year for scope 3?",
             "cs": "Jaký je váš výchozí rok u kategorie 3?"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesAbsoluteTarget'",
            "choicesFromQuestion": "asboluteTargetBaselineYearScope1-2",
            "choices": [
             {
              "value": "baselineYear2022",
              "text": "2022"
             },
             {
              "value": "baselineYear2021",
              "text": "2021"
             },
             {
              "value": "baselineYear2020",
              "text": "2020"
             },
             {
              "value": "baselineYear2019",
              "text": "2019"
             },
             {
              "value": "baselineYear2018",
              "text": "2018"
             },
             {
              "value": "baselineYear2017",
              "text": "2017"
             },
             {
              "value": "baselineYear2016",
              "text": "2016"
             },
             {
              "value": "baselineYear2015",
              "text": "2015"
             }
            ],
            "showOtherItem": true,
            "otherText": {
             "default": "Earlier than 2015, namely...",
             "cs": "Dříve než rok 2015, konkrétněji…"
            }
           },
           {
            "type": "text",
            "name": "asboluteTargetGhgEmissionsInBaselineYearScope3",
            "title": {
             "default": "What were your GHG emissions in the baseline year for scope 3?",
             "cs": "Jaké byly vaše emise skleníkových plynů ve vašem výchozím roce pro kategorii 3?"
            },
            "description": {
             "default": " metric tonnes CO2e",
             "cs": "metrické tuny ekvivalentu CO2"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesAbsoluteTarget'",
            "inputType": "number",
            "inputMask": "decimal"
           },
           {
            "type": "dropdown",
            "name": "asboluteTargetNearTermTargetYearScope3",
            "title": {
             "default": "What is the near-term target year for scope 3?",
             "cs": "Jaký je nejbližší cílový rok pro kategorii 3?"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesAbsoluteTarget'",
            "choices": [
             {
              "value": "targetYear2023",
              "text": "2023"
             },
             {
              "value": "targetYear2024",
              "text": "2024"
             },
             {
              "value": "targetYear2025",
              "text": "2025"
             },
             {
              "value": "targetYear2026",
              "text": "2026"
             },
             {
              "value": "targetYear2027",
              "text": "2027"
             },
             {
              "value": "targetYear2028",
              "text": "2028"
             },
             {
              "value": "targetYear2029",
              "text": "2029"
             },
             {
              "value": "targetYear2030",
              "text": "2030"
             },
             {
              "value": "targetYear2031",
              "text": "2031"
             },
             {
              "value": "targetYear2032",
              "text": "2032"
             },
             {
              "value": "targetYear2033",
              "text": "2033"
             },
             {
              "value": "targetYear2034",
              "text": "2034"
             },
             {
              "value": "targetYear2035",
              "text": "2035"
             },
             {
              "value": "targetYear2036",
              "text": "2036"
             },
             {
              "value": "targetYear2037",
              "text": "2037"
             },
             {
              "value": "targetYear2038",
              "text": "2038"
             },
             {
              "value": "targetYear2039",
              "text": "2039"
             },
             {
              "value": "targetYear2040",
              "text": "2040"
             },
             {
              "value": "targetYear2041",
              "text": "2041"
             },
             {
              "value": "targetYear2042",
              "text": "2042"
             },
             {
              "value": "targetYear2043",
              "text": "2043"
             },
             {
              "value": "targetYear2044",
              "text": "2044"
             },
             {
              "value": "targetYear2045",
              "text": "2045"
             },
             {
              "value": "targetYear2046",
              "text": "2046"
             },
             {
              "value": "targetYear2047",
              "text": "2047"
             },
             {
              "value": "targetYear2048",
              "text": "2048"
             },
             {
              "value": "targetYear2049",
              "text": "2049"
             },
             {
              "value": "targetYear2050",
              "text": "2050"
             }
            ]
           },
           {
            "type": "text",
            "name": "asboluteTargetReductionTargetScope3",
            "title": {
             "default": "What is the reduction target for scope 3?",
             "cs": "Jaký je váš cíl pro snížení emisí kategorie 3?"
            },
            "description": {
             "default": "% percentage",
             "cs": "% procentuálně"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesAbsoluteTarget'",
            "inputType": "number",
            "min": 0,
            "max": 100,
            "step": 5,
            "inputMask": "decimal"
           }
          ],
          "visibleIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesNotPublishedAbsoluteTarget']",
          "title": {
           "default": "Absolute target for scope 3",
           "cs": "Absolutní cíl pro kategorii 3"
          }
         },
         {
          "type": "panel",
          "name": "intensityTargetScope3",
          "elements": [
           {
            "type": "dropdown",
            "name": "intensityTargetBaselineYearScope3",
            "title": {
             "default": "What is your baseline year for scope 3?",
             "cs": "Jaký je váš výchozí rok pro kategorii 3?"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesIntensityTarget'",
            "choicesFromQuestion": "intensityTargetBaselineYearScope1-2",
            "choices": [
             {
              "value": "baselineYear2022",
              "text": "2022"
             },
             {
              "value": "baselineYear2021",
              "text": "2021"
             },
             {
              "value": "baselineYear2020",
              "text": "2020"
             },
             {
              "value": "baselineYear2019",
              "text": "2019"
             },
             {
              "value": "baselineYear2018",
              "text": "2018"
             },
             {
              "value": "baselineYear2017",
              "text": "2017"
             },
             {
              "value": "baselineYear2016",
              "text": "2016"
             },
             {
              "value": "baselineYear2015",
              "text": "2015"
             }
            ],
            "showOtherItem": true,
            "otherText": {
             "default": "Earlier than 2015, namely...",
             "cs": "Dříve než rok 2015, konkrétněji…"
            }
           },
           {
            "type": "text",
            "name": "intensityTargetGhgEmissionsInBaselineYearScope3",
            "title": {
             "default": "What were your GHG emissions in the baseline year for scope 3?",
             "cs": "Jaké jste měli emise skleníkových plynů ve vašem výchozím roce pro kategorii 3?"
            },
            "description": {
             "default": " metric tonnes CO2e",
             "cs": "metrické tuny ekvivalentu CO2"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesIntensityTarget'",
            "inputType": "number",
            "inputMask": "decimal"
           },
           {
            "type": "dropdown",
            "name": "intensityTargetNearTermTargetYearScope3",
            "title": {
             "default": "What is the near-term target year for scope 3?",
             "cs": "Jaký je nejbližší cílový rok pro kategorii 3?"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesIntensityTarget'",
            "choices": [
             {
              "value": "targetYear2023",
              "text": "2023"
             },
             {
              "value": "targetYear2024",
              "text": "2024"
             },
             {
              "value": "targetYear2025",
              "text": "2025"
             },
             {
              "value": "targetYear2026",
              "text": "2026"
             },
             {
              "value": "targetYear2027",
              "text": "2027"
             },
             {
              "value": "targetYear2028",
              "text": "2028"
             },
             {
              "value": "targetYear2029",
              "text": "2029"
             },
             {
              "value": "targetYear2030",
              "text": "2030"
             },
             {
              "value": "targetYear2031",
              "text": "2031"
             },
             {
              "value": "targetYear2032",
              "text": "2032"
             },
             {
              "value": "targetYear2033",
              "text": "2033"
             },
             {
              "value": "targetYear2034",
              "text": "2034"
             },
             {
              "value": "targetYear2035",
              "text": "2035"
             },
             {
              "value": "targetYear2036",
              "text": "2036"
             },
             {
              "value": "targetYear2037",
              "text": "2037"
             },
             {
              "value": "targetYear2038",
              "text": "2038"
             },
             {
              "value": "targetYear2039",
              "text": "2039"
             },
             {
              "value": "targetYear2040",
              "text": "2040"
             },
             {
              "value": "targetYear2041",
              "text": "2041"
             },
             {
              "value": "targetYear2042",
              "text": "2042"
             },
             {
              "value": "targetYear2043",
              "text": "2043"
             },
             {
              "value": "targetYear2044",
              "text": "2044"
             },
             {
              "value": "targetYear2045",
              "text": "2045"
             },
             {
              "value": "targetYear2046",
              "text": "2046"
             },
             {
              "value": "targetYear2047",
              "text": "2047"
             },
             {
              "value": "targetYear2048",
              "text": "2048"
             },
             {
              "value": "targetYear2049",
              "text": "2049"
             },
             {
              "value": "targetYear2050",
              "text": "2050"
             }
            ]
           },
           {
            "type": "text",
            "name": "intensityTargetReductionTargetScope3",
            "title": {
             "default": "What is the reduction target for scope 3?",
             "cs": "Jaký je váš cíl snížení pro kategorii 3?"
            },
            "description": {
             "default": "% percentage",
             "cs": "% procentuálně"
            },
            "requiredIf": "{emissionReductionTargetsScope3} = 'yesIntensityTarget'",
            "inputType": "number",
            "min": 0,
            "max": 100,
            "step": 5,
            "inputMask": "decimal"
           }
          ],
          "visibleIf": "{emissionReductionTargetsScope3} anyof ['yesIntensityTarget', 'yesNotPublishedIntensityTarget']",
          "title": {
           "default": "Intensity target for scope 3",
           "cs": "Cíl intenzity pro kategorii 3"
          }
         },
         {
          "type": "comment",
          "name": "reductionPlanScope3",
          "visibleIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget', 'yesNotPublishedAbsoluteTarget', 'yesNotPublishedIntensityTarget']",
          "title": {
           "default": "Can you share your plan how the reduction target on scope 3 will be realized?",
           "cs": "Jak budete snížení emisí kategorie 3 realizovat?"
          },
          "description": {
           "default": "Please include at least the reduction actions/ measures, the expected impact and the year of realization for the biggest reductions.",
           "cs": "Uveďte, prosím, alespoň redukční činy/opatření, očekávaný dopad a rok realizace u největších snížení."
          },
          "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget', 'yesNotPublishedAbsoluteTarget', 'yesNotPublishedIntensityTarget']"
         },
         {
          "type": "panel",
          "name": "flagTargets",
          "elements": [
           {
            "type": "html",
            "name": "flagTargetExplanation",
            "html": {
             "default": "<p>FLAG science-based targets (SBTs) that apply to a company&rsquo;s Forest, Land, and Agriculture (FLAG) related emissions, including:</p>\n\n<ul>\n\t<li>Emissions associated with land use change (LUC) (i.e. biomass and soil carbon losses from deforestation and forest degradation, conversion of coastal wetlands and peatland burning) and</li>\n\t<li>Emissions from land management (i.e. N2O and CH4 from enteric fermentation, biomass burning, nutrient management, fertilizer use, and manure management and - GHG emissions from machinery and fertilizer manufacture).</li>\n</ul>\n\n<p><a href=\"https://www.sciencebasedtargets.org/sectors/forest-land-and-agriculture#resources\" target=\"_blank\">www.sciencebasedtargets.org/sectors/forest-land-and-agriculture#resources</a></p>\n",
             "cs": "<p>Vědecké cíle (SBT) FLAG, které se vztahují na emise související s lesy, půdou a zemědělstvím (FLAG) společnosti, včetně:</p><ul><li>Emise související se změnou využívání půdy (LUC) (tj. ztráty uhlíku z biomasy a půdy v důsledku odlesňování a degradace lesů, přeměna pobřežních mokřadů a vypalování rašelinišť) a</li><li>Emise z hospodaření s půdou (tj. N2O a CH4 z enterické fermentace, spalování biomasy, hospodaření s živinami, používání hnojiv a hospodaření s hnojem a – emise skleníkových plynů ze strojů a výroby hnojiv).</li></ul><p><a href=\"https://www.sciencebasedtargets.org/sectors/forest-land-and-agriculture#resources\" target=\"_blank\">www.sciencebasedtargets.org/sectors/forest-land-and-agriculture#resources</a></p>"
            }
           },
           {
            "type": "radiogroup",
            "name": "flagTarget",
            "title": "Has your company set a FLAG target?",
            "isRequired": true,
            "choices": [
             {
              "value": "yesAbsoluteTarget",
              "text": "Yes, an absolute FLAG target"
             },
             {
              "value": "yesIntensityTarget",
              "text": {
               "default": "Yes, intensity targets",
               "cs": "Ano, cíl intenzity"
              }
             },
             {
              "value": "yesNotPublished",
              "text": {
               "default": "Yes, but not published",
               "cs": "Ano, ale nezveřejněné"
              }
             },
             {
              "value": "inProcessSettingTargets",
              "text": {
               "default": "In the process of setting targets",
               "cs": "V procesu stanovení cílů"
              }
             },
             {
              "value": "no",
              "text": {
               "default": "No",
               "cs": "Ne"
              }
             }
            ]
           }
          ],
          "title": "FLAG targets"
         }
        ],
        "title": {
         "default": "Emission targets: Scope 3",
         "cs": "Emisní cíle: Kategorie 3"
        }
       },
       {
        "name": "scienceBasedTargets",
        "elements": [
         {
          "type": "radiogroup",
          "name": "targetsApprovedBySBTi",
          "title": {
           "default": "Have your scope 1, 2 & 3 targets been validated by the Science-Based Targets Initiative (SBTi)?",
           "cs": "Byly vaše cíle pro kategorie 1, 2 a 3 potvrzeny iniciativou Science-Based Targets Initiative (SBTi)?"
          },
          "requiredIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesIntensityTarget'] or {emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
          "choices": [
           {
            "value": "yes",
            "text": {
             "default": "Yes",
             "cs": "Ano"
            }
           },
           {
            "value": "yesButNoFlagTargetSet",
            "text": {
             "default": "Yes, but we haven't set FLAG targets yet",
             "cs": "Ano, ale nemáme ještě určeny cíle FLAG"
            }
           },
           {
            "value": "inProcessBeingApproved",
            "text": {
             "default": "In the process of being approved / committed",
             "cs": "V procesu schválení / závazku"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           }
          ]
         },
         {
          "type": "radiogroup",
          "name": "netZeroTargets",
          "title": {
           "default": "Has your company set net-zero targets?",
           "cs": "Stanovila si vaše společnost net-zero cíle?"
          },
          "requiredIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesIntensityTarget'] or {emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
          "choices": [
           {
            "value": "yes",
            "text": {
             "default": "Yes",
             "cs": "Ano"
            }
           },
           {
            "value": "inProcessBeingApproved",
            "text": {
             "default": "In the process of being approved / committed",
             "cs": "V procesu schválení / závazku"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           }
          ]
         }
        ],
        "visibleIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesIntensityTarget'] or {emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
        "title": {
         "default": "Science-based targets",
         "cs": "Vědecké cíle (SBTs)"
        }
       },
       {
        "name": "emissionCalculations",
        "elements": [
         {
          "type": "html",
          "name": "emissionCalculationsExplanation",
          "html": {
           "default": "Ahold Delhaize is bound by the rules of the SBTi, we need to assess the data quality of our suppliers. To comply with those rules we ask all companies that use another tool / emission factors than formally approved in our guidebook, to send information about your tool to us to assess. If the reporting company has a third party GHG audit, then we expect that the third party does the quality control of the tools and the data and a separate assessment from Ahold Delhaize is not needed.",
           "cs": "Ahold Delhaize, respektive Albert Česká republika je vázána pravidly SBTi (Science-Based Targets Initiative), a proto potřebujeme i kvalitní data od našich dodavatelů. Abychom mohli požadavky SBTi splnit, žádáme firmy, které používají jiné nástroje pro výpočet uhlíkové stopy, popřípadě odlišné emisní faktory, než které jsou uvedeny a schváleny v našem manuálu, aby nám poskytli informace o těchto nástrojích, abychom mohli posoudit jejich vhodnost. V případě, že by byl pro výpočet uhlíkové stopy využit GHG audit třetí strany, předpokládáme, že tato auditní společnost provádí kontrolu kvality použitých nástrojů pro výpočet a zvláštní posouzení ze strany Ahold Delhaize, respektive Albert Česká republika již nebude potřeba."
          }
         },
         {
          "type": "radiogroup",
          "name": "methodologyUsedForEmissionsCalculations",
          "title": {
           "default": "What calculation method have you used to calculate your emissions data?",
           "cs": "Jakou výpočetní metodologii jste použili pro výpočet vaší uhlíkové stopy?"
          },
          "description": {
           "default": "For more information, please check the AD Scope 3 guidebook chapter 6.3.1.",
           "cs": "Více informací naleznete v našem manuálu \"AD Scope 3 guidebook\" v kapitole 6.3.1."
          },
          "isRequired": true,
          "choices": [
           {
            "value": "supplierSpecificMethod",
            "text": {
             "default": "The supplier-specific method (i.e. using primary data)",
             "cs": "Metoda specifická pro dodavatele (tj. pomocí primárních dat)"
            }
           },
           {
            "value": "hybridMethod",
            "text": {
             "default": "The hybrid method (i.e. using both primary and secondary data)",
             "cs": "Hybridní metoda (tj. pomocí primárních i sekundárních dat)"
            }
           },
           {
            "value": "averageDataMethod",
            "text": {
             "default": "The average-data method (i.e. using secondary data only)",
             "cs": "Metoda průměrných dat (tj. pomocí sekundárních dat)"
            }
           }
          ],
          "showOtherItem": true,
          "otherText": {
           "default": "Other (please explain your method)",
           "cs": "Jiné (prosím vysvětlete vaši metodu)"
          }
         },
         {
          "type": "radiogroup",
          "name": "percentageBasedOnSupplierSpecificData",
          "visibleIf": "{methodologyUsedForEmissionsCalculations} anyof ['supplierSpecificMethod', 'hybridMethod']",
          "title": {
           "default": "Which % of your GHG emissions are based on supplier-specific data?",
           "cs": "Jaké % vašich skleníkových plynů je založeno na metodě specifické pro dodavatele?"
          },
          "description": {
           "default": "If possible please base the % on the part of the footprint that is allocated for AD Brands.",
           "cs": "Pokud je to možné, určete % z vaší celkové uhlíkové stopy, která je přidělena pro Ahold Delhaize (všechny značky společnosti)"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "76-100",
            "text": "76-100%"
           },
           {
            "value": "51-75",
            "text": "51-75%"
           },
           {
            "value": "26-50",
            "text": "26-50%"
           },
           {
            "value": "1-25",
            "text": "1-25%"
           }
          ]
         },
         {
          "type": "checkbox",
          "name": "categoriesIncludedInScope3",
          "title": {
           "default": "Which categories have you included in scope 3?",
           "cs": "Které z uvedených kategorií jste zahrnuli do vašeho výpočtu kategorie 3?"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "purchasedGoodsAndServices",
            "text": {
             "default": "1. Purchased Goods and Services",
             "cs": "1. Nákup zboží a služeb"
            }
           },
           {
            "value": "capitalGoods",
            "text": {
             "default": "2. Capital Goods",
             "cs": "2. Kapitálové statky"
            }
           },
           {
            "value": "fuelAndEnergyRelatedActivities",
            "text": {
             "default": "3. Fuel- and Energy-Related Activities (not included in scope 1 & 2)",
             "cs": "3. Aktivity spojené s palivy a energiemi (které nejsou zahrnuty v kategoriích 1 a 2)"
            }
           },
           {
            "value": "upstreamTransportationAndDistribution",
            "text": {
             "default": "4. Upstream Transportation and Distribution",
             "cs": "4. Doprava a distribuce směrem k dodavateli (upstream)"
            }
           },
           {
            "value": "wasteGeneratedinOperations",
            "text": {
             "default": "5. Waste Generated in Operations",
             "cs": "5. Odpad vznikající v provozu"
            }
           },
           {
            "value": "businessTravel",
            "text": {
             "default": "6. Business Travel",
             "cs": "6. Obchodní cesty"
            }
           },
           {
            "value": "employeeCommuting",
            "text": {
             "default": "7. Employee Commuting",
             "cs": "7. Dojíždění zaměstnanců"
            }
           },
           {
            "value": "upstreamLeasedAssets",
            "text": {
             "default": "8. Upstream Leased Assets",
             "cs": "8. Pronajatá aktiva směrem k dodavateli (upstream)"
            }
           },
           {
            "value": "downstreamTransportationAndDistribution",
            "text": {
             "default": "9. Downstream Transportation and Distribution",
             "cs": "9. Doprava a distribuce směrem ke spotřebiteli (downstream)"
            }
           },
           {
            "value": "processingOfSoldProducts",
            "text": {
             "default": "10. Processing of Sold Products",
             "cs": "10. Zpracování prodaných výrobků"
            }
           },
           {
            "value": "useOfSoldProducts",
            "text": {
             "default": "11. Use of Sold Products",
             "cs": "11. Použití prodaných výrobků"
            }
           },
           {
            "value": "downstreamLeasedAssets",
            "text": {
             "default": "13. Downstream Leased Assets",
             "cs": "13. Pronajatá aktiva směrem ke spotřebiteli (downstream)"
            }
           },
           {
            "value": "franchises",
            "text": {
             "default": "14. Franchises",
             "cs": "14. Franšízy"
            }
           },
           {
            "value": "investments",
            "text": {
             "default": "15. Investments",
             "cs": "15. Investice"
            }
           }
          ]
         },
         {
          "type": "checkbox",
          "name": "toolsAndPlatformsUsedForEmissionsCalculation",
          "title": {
           "default": "Which tools and/or platforms have you used to calculate your emissions data?",
           "cs": "Jaké nástroje, respektive platformy jste použili pro výpočet vašich emisí?"
          },
          "description": {
           "default": "For scope 1,2 & 3",
           "cs": "Pro kategorie 1, 2 a 3"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "ghgProtocolEmissionsCalculationTool",
            "text": {
             "default": "GHG protocol emissions calculation tool",
             "cs": "GHG Protocol kalkulačka"
            }
           },
           {
            "value": "excelSheetForScope1-2CalculationExcel sheet for Scope 1 & 2 calculation",
            "text": {
             "default": "Excel sheet for Scope 1 & 2 calculation",
             "cs": "Excel pro kategorie 1 a 2"
            }
           },
           {
            "value": "epaCalculatorScope1-2",
            "text": {
             "default": "EPA calculator Scope 1 & 2",
             "cs": "EPA kalkulačka pro kategorie 1 a 2"
            }
           },
           {
            "value": "adScope1-2Calculator",
            "text": {
             "default": "AD scope 1 & 2 calculator",
             "cs": "AD kalkulačka pro kategorie 1 a 2"
            }
           },
           {
            "value": "co2EmissiefactorenCalculator",
            "text": {
             "default": "CO2 emissiefactoren calculator",
             "cs": "CO2 emissiefactoren kalkulačka"
            }
           },
           {
            "value": "agriFootprint3",
            "text": "Agri-footprint 3.0"
           },
           {
            "value": "lcaCalculation",
            "text": {
             "default": "LCA calculation (according to the ISO 14060 family)",
             "cs": "LCA kalkulačka (dle ISO 14060)"
            }
           },
           {
            "value": "euProductEnvironmentalFootprint",
            "text": "EU Product Environmental Footprint (EUPEF)"
           },
           {
            "value": "coolFarmTool",
            "text": "Cool Farm Tool"
           },
           {
            "value": "farmCarbonToolkit",
            "text": "Farm Carbon Toolkit"
           },
           {
            "value": "fieldToMarket",
            "text": "Field to market"
           },
           {
            "value": "bilanCarbone",
            "text": "Bilan Carbone"
           }
          ],
          "showOtherItem": true,
          "otherText": {
           "default": "Other (please describe the tools and/or platforms that you have used and provide weblinks)",
           "cs": "Jiné (prosím popište nástroje, respektive platformy, které jste použili včetně webových stránek)"
          }
         }
        ],
        "title": {
         "default": "Emission calculations",
         "cs": "Výpočet emisí"
        }
       },
       {
        "name": "emissionsData",
        "elements": [
         {
          "type": "panel",
          "name": "intensityFactors",
          "elements": [
           {
            "type": "html",
            "name": "intensityFactorsExplanation",
            "html": {
             "default": "<p>Intensity is calculated by dividing the absolute emissions (the numerator) by an organization-specific metric (the denominator).  </p>\n\n<p>If you produce 100 kg of chocolate and you calculated that your CO2 footprint for scope 3 is 150 kg CO2 your intensity factor is 150/100 = 1,5 kg CO2e/kg</p>",
             "cs": "<p>Intenzita se vypočítá vydělením absolutních emisí (čitatel) metrikou specifickou pro organizaci (jmenovatelem).</p><p>Pokud vyrobíte 100 kg čokolády a spočítali jste, že vaše stopa CO2 pro kategorii 3 je 150 kg CO2, váš faktor intenzity je 150/100 = 1,5 kg CO2e/kg</p>"
            }
           },
           {
            "type": "dropdown",
            "name": "intensityFactorProductGroup",
            "title": {
             "default": "Please provide your product group. If you provide more than one product group, please choose the product group that has the largest CO2 footprint, based on your calculation or if this is unknown the largest product group going by sales of all Ahold Delhaize brands. ",
             "cs": "Prosím uveďte vaší produktovou skupinu. V případě, že byste chtěli označit více kategorií, uvedťe pouze tu, která má na základě vašeho výpočtu největší CO2 stopu. Pokud byste toto množství nevěděli, uveďte kategorii dle největšího prodeje společnosti Ahold Delhaize, respektive Albert Česká republika."
            },
            "valueName": "productGroup",
            "isRequired": true,
            "choices": [
             {
              "value": "detergents",
              "text": {
               "default": "Detergents",
               "cs": "Detergenty"
              }
             },
             {
              "value": "generalNonFood",
              "text": {
               "default": "General Non Food",
               "cs": "Obecné nepotravinářské zboží"
              }
             },
             {
              "value": "healthBeautyCare",
              "text": {
               "default": "Health & Beauty Care (HBC)",
               "cs": "Péče o zdraví a krásu (HBC)"
              }
             },
             {
              "value": "notForResale",
              "text": {
               "default": "Not For Resale (NFR)",
               "cs": "Není určeno k dalšímu prodeji (NFR)"
              }
             },
             {
              "value": "petfood",
              "text": {
               "default": "Petfood",
               "cs": "Krmivo pro domácí zvířata"
              }
             },
             {
              "value": "smoking",
              "text": {
               "default": "Smoking",
               "cs": "Kouření"
              }
             },
             {
              "value": "textile",
              "text": {
               "default": "Textile",
               "cs": "Textil"
              }
             },
             {
              "value": "beverages",
              "text": {
               "default": "Beverages",
               "cs": "Nápoje"
              }
             },
             {
              "value": "breadBakeryProducts",
              "text": {
               "default": "Bread/ Bakery Products/ Grain based products",
               "cs": "Chléb/ Pekařské výrobky/ Výrobky na bázi obilí"
              }
             },
             {
              "value": "butterOilsFats",
              "text": {
               "default": "Butter/ Butter Substitutes/ Oils/ Fats Edible",
               "cs": "Máslo/ Náhražky másla/ Oleje/ Jedlé tuky"
              }
             },
             {
              "value": "cheeseAndSubstitutes",
              "text": {
               "default": "Cheese/ Cheese Substitutes",
               "cs": "Sýry/ Náhražky sýrů"
              }
             },
             {
              "value": "coffeeTeaSubstitutes",
              "text": {
               "default": "Coffee/ Tea/ Substitutes",
               "cs": "Káva/ Čaj/ Náhražky"
              }
             },
             {
              "value": "confectioneryProducts",
              "text": {
               "default": "Confectionery Products",
               "cs": "Cukrářské výrobky"
              }
             },
             {
              "value": "dairy",
              "text": {
               "default": "Dairy",
               "cs": "Mléčné výrobky"
              }
             },
             {
              "value": "eggsSubstitutes",
              "text": {
               "default": "Eggs/ Egg Substitutes/ Salads (mayonnaise based)",
               "cs": "Vejce/ Vaječné náhražky/ Saláty (na bázi majonézy)"
              }
             },
             {
              "value": "fish",
              "text": {
               "default": "Fish",
               "cs": "Ryby"
              }
             },
             {
              "value": "floral",
              "text": {
               "default": "Floral",
               "cs": "Květiny"
              }
             },
             {
              "value": "fruitVegetables",
              "text": {
               "default": "Fruit & Vegetables",
               "cs": "Ovoce a Zelenina"
              }
             },
             {
              "value": "iceCream",
              "text": {
               "default": "Ice cream",
               "cs": "Zmrzlina"
              }
             },
             {
              "value": "infantFormula",
              "text": {
               "default": "Infant formula, milk powder",
               "cs": "Kojenecká výživa, sušené mléko"
              }
             },
             {
              "value": "meals",
              "text": {
               "default": "Meals",
               "cs": "Hotová jídla"
              }
             },
             {
              "value": "meatMix",
              "text": {
               "default": "Meat mix",
               "cs": "Masová směs"
              }
             },
             {
              "value": "meatBeef",
              "text": {
               "default": "Meat/ Beef",
               "cs": "Maso/ Hovězí"
              }
             },
             {
              "value": "meatLamb",
              "text": {
               "default": "Meat/ Lamb",
               "cs": "Maso/ Jehněčí"
              }
             },
             {
              "value": "meatPork",
              "text": {
               "default": "Meat/ Pork",
               "cs": "Maso/ Vepřové"
              }
             },
             {
              "value": "meatWild",
              "text": {
               "default": "Meat/ Wild/ other",
               "cs": "Maso/ Zvěřina/ Jiné"
              }
             },
             {
              "value": "meatPoultry",
              "text": {
               "default": "Meat/ Poultry",
               "cs": "Maso/ Drůběž"
              }
             },
             {
              "value": "nutsSeedsChips",
              "text": {
               "default": "Nuts/ Seeds/ Chips/ Salty snacks",
               "cs": "Ořechy/ Semínka/ Chipsy/ Slané pochutiny"
              }
             },
             {
              "value": "otherFood",
              "text": {
               "default": "Other food",
               "cs": "Jiné"
              }
             },
             {
              "value": "seafood",
              "text": {
               "default": "Seafood",
               "cs": "Mořské plody"
              }
             }
            ],
            "choicesFromQuestionMode": "selected",
            "choicesOrder": "asc"
           },
           {
            "type": "radiogroup",
            "name": "intensityFactorDimension",
            "title": {
             "default": "What is the dimension of your intensity factor?",
             "cs": "Jaký je rozměr vašeho faktoru intenzity?"
            },
            "description": {
             "default": "The dimensions for the intensity factors for scope 1, 2 & 3 have to be the same: so either based on kg product or on money.",
             "cs": "Rozměry faktorů intenzity pro kategorie 1, 2 a 3 musí být stejné: buď na základě kg produktu nebo peněz."
            },
            "valueName": "intensityFactor",
            "isRequired": true,
            "choices": [
             {
              "value": "kgCO2eProduct",
              "text": "kg CO2e / kg product;  kg CO2e/kWh; kg CO2e/ MJ"
             },
             {
              "value": "kgCO2eEuro",
              "text": "kg CO2e / Euro"
             },
             {
              "value": "kgCO2eDollar",
              "text": "kg CO2e / Dollar"
             },
             {
              "value": "kgCO2eRon",
              "text": "kg CO2e / Ron"
             },
             {
              "value": "kgCO2eRDS",
              "text": "kg CO2e / RDS"
             },
             {
              "value": "kgCO2eCzK",
              "text": "kg CO2e / CzK"
             }
            ]
           },
           {
            "type": "text",
            "name": "intensityFactorScope1-2Kg",
            "visibleIf": "{intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 1 & 2 emissions?",
             "cs": "Jaký je váš faktor intenzity pro emise kategorií 1 a 2?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "Please check if the intensity factor you have filled in is correct; it is exceeding our expectations.",
               "cs": "Prosím, zkontrolujte, zda faktor intenzity, který jste zadali, je správně"
              },
              "maxValue": 0.5
             }
            ],
            "inputType": "number",
            "autocomplete": "name",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope1-2Valuta",
            "visibleIf": "{intensityFactor} anyof ['kgCO2eEuro', 'kgCO2eDollar', 'kgCO2eRon', 'kgCO2eRDS', 'kgCO2eCzK']",
            "title": {
             "default": "What is your intensity factor for scope 1 & 2 emissions?",
             "cs": "Jaký je váš faktor intenzity pro emise kategorií 1 a 2?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope1-2} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "inputType": "number",
            "autocomplete": "name",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodKg",
            "visibleIf": "{productGroup} anyof ['detergents', 'generalNonFood', 'healthBeautyCare', 'notForResale', 'smoking', 'textile'] and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodValutaDollar",
            "visibleIf": "{productGroup} anyof ['detergents', 'generalNonFood', 'healthBeautyCare', 'notForResale', 'smoking', 'textile'] and {intensityFactor} = 'kgCO2eDollar'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodDetergentsValutaEuro",
            "visibleIf": "{productGroup} = 'detergents' and {intensityFactor} = 'kgCO2eEuro'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 2.4
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodDetergentsValutaRon",
            "visibleIf": "{productGroup} = 'detergents' and {intensityFactor} = 'kgCO2eRon'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.49608
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodDetergentsValutaRds",
            "visibleIf": "{productGroup} = 'detergents' and {intensityFactor} = 'kgCO2eRDS'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.0204
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodDetergentsValutaCzk",
            "visibleIf": "{productGroup} = 'detergents' and {intensityFactor} = 'kgCO2eCzK'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.093348891
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodGeneralNonFoodValutaEuro",
            "visibleIf": "{productGroup} = 'generalNonFood' and {intensityFactor} = 'kgCO2eEuro'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 1.2
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodGeneralNonFoodValutaRon",
            "visibleIf": "{productGroup} = 'generalNonFood' and {intensityFactor} = 'kgCO2eRon'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.24804
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodGeneralNonFoodValutaRds",
            "visibleIf": "{productGroup} = 'generalNonFood' and {intensityFactor} = 'kgCO2eRDS'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.0102
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodGeneralNonFoodValutaCzk",
            "visibleIf": "{productGroup} = 'generalNonFood' and {intensityFactor} = 'kgCO2eCzK'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.046674446
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodHealthBeautyCareValutaEuro",
            "visibleIf": "{productGroup} = 'healthBeautyCare' and {intensityFactor} = 'kgCO2eEuro'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 2.55
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodHealthBeautyCareValutaRon",
            "visibleIf": "{productGroup} = 'healthBeautyCare' and {intensityFactor} = 'kgCO2eRon'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.527085
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodHealthBeautyCareValutaRds",
            "visibleIf": "{productGroup} = 'healthBeautyCare' and {intensityFactor} = 'kgCO2eRDS'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.021675
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodHealthBeautyCareValutaCzk",
            "visibleIf": "{productGroup} = 'healthBeautyCare' and {intensityFactor} = 'kgCO2eCzK'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.099183197
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodNotForResaleValutaEuro",
            "visibleIf": "{productGroup} = 'notForResale' and {intensityFactor} = 'kgCO2eEuro'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 2.7
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodNotForResaleValutaRon",
            "visibleIf": "{productGroup} = 'notForResale' and {intensityFactor} = 'kgCO2eRon'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.55809
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodNotForResaleValutaRds",
            "visibleIf": "{productGroup} = 'notForResale' and {intensityFactor} = 'kgCO2eRDS'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.02295
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodNotForResaleValutaCzk",
            "visibleIf": "{productGroup} = 'notForResale' and {intensityFactor} = 'kgCO2eCzK'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.105017503
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodSmokingValutaEuro",
            "visibleIf": "{productGroup} = 'smoking' and {intensityFactor} = 'kgCO2eEuro'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 1.5
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodSmokingValutaRon",
            "visibleIf": "{productGroup} = 'smoking' and {intensityFactor} = 'kgCO2eRon'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.31005
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodSmokingValutaRds",
            "visibleIf": "{productGroup} = 'smoking' and {intensityFactor} = 'kgCO2eRDS'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.01275
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodSmokingValutaCzk",
            "visibleIf": "{productGroup} = 'smoking' and {intensityFactor} = 'kgCO2eCzK'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.058343057
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodTextileValutaEuro",
            "visibleIf": "{productGroup} = 'textile' and {intensityFactor} = 'kgCO2eEuro'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.9
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodTextileValutaRon",
            "visibleIf": "{productGroup} = 'textile' and {intensityFactor} = 'kgCO2eRon'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.18603
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NonfoodTextileValutaRds",
            "visibleIf": "{productGroup} = 'textile' and {intensityFactor} = 'kgCO2eRDS'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.00765
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3TextileValutaCzk",
            "visibleIf": "{productGroup} = 'textile' and {intensityFactor} = 'kgCO2eCzK'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.035005834
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodValuta",
            "visibleIf": "({productGroup} anyof ['beverages', 'breadBakeryProducts', 'butterOilsFats', 'cheeseAndSubstitutes', 'coffeeTeaSubstitutes', 'confectioneryProducts', 'dairy', 'eggsSubstitutes', 'fish', 'floral', 'fruitVegetables', 'iceCream', 'infantFormula', 'meals', 'meatMix', 'meatBeef', 'meatLamb', 'meatPork', 'meatPoultry', 'meatWild', 'nutsSeedsChips', 'otherFood', 'petfood', 'seafood']) and ({intensityFactor} anyof ['kgCO2eEuro', 'kgCO2eDollar', 'kgCO2eRon', 'kgCO2eRDS', 'kgCO2eCzK'])",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodBeveragesKg",
            "visibleIf": "{productGroup} = 'beverages' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 3.45
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodBreadBakeryProductsKg",
            "visibleIf": "{productGroup} = 'breadBakeryProducts' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 3.45
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodButterOilsFatsKg",
            "visibleIf": "{productGroup} = 'butterOilsFats' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 5.79
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodCheeseAndSubstitutesKg",
            "visibleIf": "{productGroup} = 'cheeseAndSubstitutes' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 11.59
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodCoffeeTeaSubstitutesKg",
            "visibleIf": "{productGroup} = 'coffeeTeaSubstitutes' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 15.15
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodConfectioneryProductsKg",
            "visibleIf": "{productGroup} = 'confectioneryProducts' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 6.15
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodDairyKg",
            "visibleIf": "{productGroup} = 'dairy' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 4.28
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodEggsSubstitutesKg",
            "visibleIf": "{productGroup} = 'eggsSubstitutes' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 1.26
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodFishKg",
            "visibleIf": "{productGroup} = 'fish' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 15.21
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodFloralKg",
            "visibleIf": "{productGroup} = 'floral' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 2.54
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodFruitVegetablesKg",
            "visibleIf": "{productGroup} = 'fruitVegetables' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 2.09
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodIceCreamKg",
            "visibleIf": "{productGroup} = 'iceCream' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 3.09
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodInfantFormulaKg",
            "visibleIf": "{productGroup} = 'infantFormula' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 9.85
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodMealsKg",
            "visibleIf": "{productGroup} = 'meals' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 16.7
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodMeatMixKg",
            "visibleIf": "{productGroup} = 'meatMix' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 21.21
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodMeatBeefKg",
            "visibleIf": "{productGroup} = 'meatBeef' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 112.89
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodMeatLambKg",
            "visibleIf": "{productGroup} = 'meatLamb' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 54.11
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodMeatPorkKg",
            "visibleIf": "{productGroup} = 'meatPork' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 8.13
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodMeatWildKg",
            "visibleIf": "{productGroup} = 'meatWild' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 4.4
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodMeatPoultryKg",
            "visibleIf": "{productGroup} = 'meatPoultry' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 5.66
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3NutsSeedsChipsKg",
            "visibleIf": "{productGroup} = 'nutsSeedsChips' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 4.55
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodOtherFoodKg",
            "visibleIf": "{productGroup} = 'otherFood' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 5.25
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodPetfoodKg",
            "visibleIf": "{productGroup} = 'petfood' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 0.81
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "intensityFactorScope3FoodSeafoodKg",
            "visibleIf": "{productGroup} = 'seafood' and {intensityFactor} = 'kgCO2eProduct'",
            "title": {
             "default": "What is your intensity factor for scope 3 emissions?",
             "cs": "Jaký je váš faktor intezity pro emise kategorie 3?"
            },
            "description": "in {intensityFactor}",
            "isRequired": true,
            "requiredIf": "{emissionReductionTargetsScope3} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "validators": [
             {
              "type": "numeric",
              "text": {
               "default": "The intensity factor you are providing is > 150% of the theoretical value of the big climate database. Please check if the intensity factor you have filled in is correct.",
               "cs": "Faktor intenzity, který uvádíte, je > 150 % teoretické hodnoty velké klimatické databáze. Zkontrolujte, zda je správně vyplněný faktor intenzity."
              },
              "maxValue": 16.73
             }
            ],
            "inputType": "number",
            "min": 0,
            "step": 0.01,
            "placeholder": "0.00",
            "inputMask": "decimal"
           }
          ],
          "title": {
           "default": "Intensity factors",
           "cs": "Faktory intenzity"
          }
         },
         {
          "type": "panel",
          "name": "flagEmissions",
          "elements": [
           {
            "type": "text",
            "name": "flagEmissionTargetOnLandUseChange",
            "visibleIf": "{flagTarget} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "title": {
             "default": "What are your FLAG emissions from: Land use change (GHG emissions from land use change, including those associated with livestock feed)?",
             "cs": "Jaké jsou vaše emise FLAG: Změny ve využívání půdy (emise skleníkových plynů vlivem změn ve využívání půdy, včetně těch, které souvisí s krmivem pro dobytek)?"
            },
            "description": {
             "default": "metric tonnes CO2e",
             "cs": "metrické tuny ekvivalentu CO2"
            },
            "inputType": "number",
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "flagEmissionTargetOnLandManagement",
            "visibleIf": "{flagTarget} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "title": {
             "default": "What are your FLAG emissions (in metric tonnes CO2e) from: Land Management (emissions from land management (primarily N2O and CH4)? ",
             "cs": "Jaké jsou vaše emise FLAG (v metrických tunách CO2e) z: Obhospodařování půdy (emise z obhospodařování půdy (především N2O a CH4)?"
            },
            "description": {
             "default": "GHG emissions related to on-farm vehicle and to fertilizer production are also included, as these emissions are commonly embedded in accounting tools and emission factors associated with land management",
             "cs": "Zahrnuty jsou také emise skleníkových plynů související s výrobou zemědělských vozidel a hnojiv, protože tyto emise jsou běžně součástí účetních nástrojů a emisních faktorů spojených s obhospodařováním půdy."
            },
            "inputMask": "decimal"
           },
           {
            "type": "text",
            "name": "flagCarbonRemovalsAndStorageTargets",
            "visibleIf": "{flagTarget} anyof ['yesAbsoluteTarget', 'yesIntensityTarget']",
            "title": {
             "default": "What are your FLAG Carbon removals and storage emissions on: carbon sequestration from improved forest management, agroforestry, afforestation/reforestation, soil organic carbon and biochar?",
             "cs": "Jaké jsou vaše emise FLAG v oblasti odstraňování a ukládání uhlíku: sekvestrace uhlíku ze zlepšeného hospodaření v lesích, agrolesnictví, zalesňování/obnovení lesů, půdní organický uhlík a biouhel?"
            },
            "description": {
             "default": "metric tonnes CO2e",
             "cs": "metrické tuny ekvivalentu CO2"
            },
            "inputType": "number",
            "inputMask": "decimal"
           }
          ],
          "title": {
           "default": "FLAG emissions",
           "cs": "Emise FLAG"
          }
         }
        ],
        "title": {
         "default": "Emissions data",
         "cs": "Údaje o emisích"
        }
       },
       {
        "name": "allocationOfEmissions",
        "elements": [
         {
          "type": "html",
          "name": "allocationOfEmissionsExplanation",
          "html": {
           "default": "Please allocate emissions (scope 1, 2 & 3) to Ahold Delhaize Brands according to the goods or services you have sold them in this reporting period.  Emissions in metric tonnes of CO2e (number), preferably calculated on product group specific emissions (S1, S2 & S3), if that is not available location specific emissions (S1, S2 & S3), if those are not available based company emissions (S1, S2 & S3). Please also check the examples in the guidebook.",
           "cs": "Přidělte prosím emise (kategorie 1, 2 a 3) jednotlivým značkám společnosti Ahold Delhaize podle zboží nebo služeb, které jste jim v tomto vykazovaném období prodali. Emise v metrických tunách CO2e (číslo), pokud možno vypočítané na základě emisí specifických pro skupinu výrobků (S1, S2 a S3), pokud nejsou k dispozici specifické emise pro lokalitu (S1, S2 a S3), pokud nejsou k dispozici na základě emisí společnosti ( S1, S2 a S3). Podívejte se také na příklady v našem manuálu."
          }
         },
         {
          "type": "text",
          "name": "allocationOfEmissionsAlfaBeta",
          "title": {
           "default": "How much metric tonnes of CO2e do you want to allocate to Alfa Beta (Greece)?",
           "cs": "Kolik metrických tun ekvivalentu CO2 chcete alokovat - Alfa Beta (Řecko)?"
          },
          "description": {
           "default": "metric tonnes of CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "isRequired": true,
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "text",
          "name": "allocationOfEmissionsAlbert",
          "title": {
           "default": "How much metric tonnes of CO2e do you want to allocate to Albert (Czech Republic)?",
           "cs": "Kolik metrických tun ekvivalentu CO2 chcete alokovat -Albert Heijn (Holandsko a Belgie)?"
          },
          "description": {
           "default": "metric tonnes of CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "isRequired": true,
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "text",
          "name": "allocationOfEmissionsAlbertHeijn",
          "title": {
           "default": "How much metric tonnes of CO2e do you want to allocate to Albert Heijn (Netherlands and Belgium)?",
           "cs": "Kolik metrických tun ekvivalentu CO2 chcete alokovat - Albert Heijn (Holandsko a Belgie)?"
          },
          "description": {
           "default": "metric tonnes of CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "isRequired": true,
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "text",
          "name": "allocationOfEmissionsDelhaizeBelgium",
          "title": {
           "default": "How much metric tonnes of CO2e do you want to allocate to Delhaize Belgium (Belgium and Luxemburg)?",
           "cs": "Kolik metrických tun ekvivalentu CO2 chcete alokovat - Delhaize Belgium (Belgie a Lucembursko)?"
          },
          "description": {
           "default": "metric tonnes of CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "isRequired": true,
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "text",
          "name": "allocationOfEmissionsDelhaizeSerbia",
          "title": {
           "default": "How much metric tonnes of CO2e do you want to allocate to Delhaize Serbia (Serbia)?",
           "cs": "Kolik metrických tun ekvivalentu CO2 chcete alokovat - Delhaize Serbia (Srbsko)?"
          },
          "description": {
           "default": "metric tonnes of CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "isRequired": true,
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "text",
          "name": "allocationOfEmissionsMegaImage",
          "title": {
           "default": "How much metric tonnes of CO2e do you want to allocate to Mega Image (Romania)?",
           "cs": "Kolik metrických tun ekvivalentu CO2 chcete alokovat - Mega Image (Rumunsko)?"
          },
          "description": {
           "default": "metric tonnes of CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "isRequired": true,
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "text",
          "name": "allocationOfEmissionsADUSA",
          "title": {
           "default": "How much metric tonnes of CO2e do you want to allocate to Ahold Delhaize USA (USA)?",
           "cs": "Kolik metrických tun ekvivalentu CO2 chcete alokovat - Ahold Delhaize USA (USA)?"
          },
          "description": {
           "default": "metric tonnes of CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "checkbox",
          "name": "methodAllocationFutureReference",
          "title": {
           "default": "Please state your method of allocation for future reference",
           "cs": "Prosím uveďte metodu, kterou jste použili pro alokaci emisí pro budoucí použití"
          },
          "description": {
           "default": "To have consistency over the years, please state if you have calculated the allocation on product group specific emissions (S1, S2 & S3), location specific emissions (S1, S2 & S3) or company emissions (S1, S2 & S3)",
           "cs": "Pro zajištění konzistentnosti v průběhu let prosím uveďte, zda jste vypočítali alokaci pro specifické emise skupiny produktů (S1, S2 a S3), emise specifické pro lokalitu (S1, S2 a S3) nebo emise společnosti (S1, S2 a S3)"
          },
          "choices": [
           {
            "value": "productGroupSpecificEmissions",
            "text": {
             "default": "Product group specific emissions (S1, S2 & S3)",
             "cs": "Specifické emise pro skupinu produktů (S1, S2 a S3)"
            }
           },
           {
            "value": "locationSpecificEmissions",
            "text": {
             "default": "Location specific emissions (S1, S2 & S3)",
             "cs": "Emise specifické pro lokalitu (S1, S2 a S3)"
            }
           },
           {
            "value": "companyEmissions",
            "text": {
             "default": "Company emissions (S1, S2 & S3)",
             "cs": "Emise společnosti (S1, S2 a S3)"
            }
           }
          ]
         }
        ],
        "title": {
         "default": "Allocation of emissions",
         "cs": "Alokace emisí"
        }
       },
       {
        "name": "externalVerification",
        "elements": [
         {
          "type": "radiogroup",
          "name": "emissionsCalculationAndReportingVerified",
          "title": {
           "default": "Have your emissions calculation and reporting been verified?",
           "cs": "Byly vaše výpočty emisí a jejich vykazování ověřeny?"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "yesByThirdParty",
            "text": {
             "default": "Yes, by a third party",
             "cs": "Ano, třetí stranou"
            }
           },
           {
            "value": "calculationsByExternalParty",
            "text": {
             "default": "Calculations have been done by external party",
             "cs": "Výpočet byl proveden externí stranou"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           }
          ],
          "showOtherItem": true,
          "otherText": {
           "default": "Other (please describe the verification and by what party)",
           "cs": "Jiné (prosím popište ověření a jakou stranou)"
          }
         },
         {
          "type": "radiogroup",
          "name": "emissionsCalculationAndReportingVerifiedThirdPartyType",
          "visibleIf": "{emissionsCalculationAndReportingVerified} = 'yesByThirdParty'",
          "title": {
           "default": "What type of third party has verified your emissions calculation and reporting?",
           "cs": "Jaký typ třetí strany ověřil vaše výpočty emisí a vykazování?"
          },
          "requiredIf": "{emissionsCalculationAndReportingVerified} = 'yesByThirdParty'",
          "choices": [
           {
            "value": "consultant",
            "text": {
             "default": "Consultant",
             "cs": "Konzultant"
            }
           },
           {
            "value": "accountant",
            "text": {
             "default": "Financial / statutory auditor (accountant)",
             "cs": "Finanční / statutární auditor (účetní)"
            }
           },
           {
            "value": "otherIndependentAssuranceServicesProvider",
            "text": {
             "default": "Other independent assurance services provider",
             "cs": "Jiný nezávislý poskytovatel ověřovacích služeb"
            }
           }
          ],
          "showOtherItem": true
         },
         {
          "type": "radiogroup",
          "name": "externalVerificationTypeOfAssurance",
          "visibleIf": "{emissionsCalculationAndReportingVerifiedThirdPartyType} = 'accountant'",
          "title": {
           "default": "What type of assurance do you have on your scope 1, 2 & 3?",
           "cs": "Jaký typ ujištění máte pro kategorie 1, 2 a 3?"
          },
          "requiredIf": "{emissionsCalculationAndReportingVerifiedThirdPartyType} = 'accountant'",
          "choices": [
           {
            "value": "scope1-2VerifiedLimitedAssurance",
            "text": {
             "default": "Our Scope 1 & 2 data is externally verified under limited assurance",
             "cs": "Naše údaje v rámci kategorií 1 a 2 jsou externě ověřeny s omezeným ujištěním"
            }
           },
           {
            "value": "scope1-2-3AccountantLimitedAssurance",
            "text": {
             "default": "An external accountant provided limited assurance over both Scope 1 & 2 and Scope 3 data",
             "cs": "Externí účetní poskytl omezené ujištění ohledně údajů kategorií 1, 2 a 3"
            }
           },
           {
            "value": "scope1-2VerifiedReasonableAssuranceAndScope3VerifiedLimitedAssurance",
            "text": {
             "default": "Our Scope 1 & 2 data is externally verified under reasonable assurance and Scope 3 data is externally verified under limited assurance",
             "cs": "Naše údaje v rámci kategorií 1 a 2 jsou externě ověřeny s přiměřenou jistotou a údaje pro kategorii 3 jsou externě ověřeny s omezeným ujištěním"
            }
           },
           {
            "value": "scope1-2VerifiedReasonableAssurance",
            "text": {
             "default": "Our Scope 1 & 2 data is externally verified under reasonable assurance",
             "cs": "Naše údaje v rámci kategorií 1 a 2 jsou externě ověřeny s přiměřenou jistotou"
            }
           },
           {
            "value": "scope1-2-3AccountantReasonableAssurance",
            "text": {
             "default": "An external accountant provided reasonable assurance over both Scope 1 & 2 and Scope 3 data",
             "cs": "Externí účetní poskytl přiměřenou jistotu ohledně údajů kategorií 1, 2 a 3"
            }
           }
          ],
          "showOtherItem": true,
          "otherText": {
           "default": "Other (please describe level and scope of verification)",
           "cs": "Jiné (prosím popište úroveň a rozsah ověření)"
          }
         }
        ],
        "title": {
         "default": "External verification",
         "cs": "Externí verifikace"
        }
       },
       {
        "name": "seequesteredAndCompensatedEmissions",
        "elements": [
         {
          "type": "html",
          "name": "seequesteredAndCompensatedEmissionsExplanation",
          "html": {
           "default": "Sequestered emissions, as long as they are part of the supply chain or services; for instance, with regenerative agriculture, we do accept them in our target but should be reported separately from a company`s scope 3 inventory. Sequestered emissions that are not part of the supply chain or services, like the compensation with CO2 credits, are not part of the target and can be reported at the compensation emission question.",
           "cs": "Sekvestrované emise, pokud jsou součástí dodavatelského řetězce nebo služeb"
          }
         },
         {
          "type": "radiogroup",
          "name": "sequesteredEmissionsInSupplyChain",
          "title": {
           "default": "Do you have sequestered emissions in your supply chain?",
           "cs": "Máte ve svém dodavatelském řetězci sekvestrované emise?"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "yes",
            "text": {
             "default": "Yes",
             "cs": "Ano"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           }
          ],
          "showOtherItem": true
         },
         {
          "type": "text",
          "name": "sequesteredEmissionsInSupplyChainTotalEmissions",
          "visibleIf": "{sequesteredEmissionsInSupplyChain} = 'yes'",
          "title": {
           "default": "What were the total sequestered emissions in metric tonnes CO2e?",
           "cs": "Jaké máte celkové sekvestrované emise v metrických tunách CO2 ekvivalentu?"
          },
          "description": {
           "default": "metric tonnes CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "requiredIf": "{sequesteredEmissionsInSupplyChain} = 'yes'",
          "inputType": "number",
          "inputMask": "decimal"
         },
         {
          "type": "radiogroup",
          "name": "sequesteredEmissionsFlagRemovals",
          "visibleIf": "{sequesteredEmissionsInSupplyChain} = 'yes'",
          "title": {
           "default": "Are these FLAG removals?",
           "cs": "Jedná se o odstranění FLAG? "
          },
          "requiredIf": "{sequesteredEmissionsInSupplyChain} = 'yes'",
          "choices": [
           {
            "value": "yes",
            "text": {
             "default": "Yes",
             "cs": "Ano"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           },
           {
            "value": "doNotKnow",
            "text": {
             "default": "I don't know",
             "cs": "Nevím"
            }
           }
          ],
          "showOtherItem": true
         },
         {
          "type": "radiogroup",
          "name": "compensatedEmissionsOffsets",
          "title": {
           "default": "Do you have compensated emissions/offsets?",
           "cs": "Kompenzujete své emise/ offsetujete?"
          },
          "isRequired": true,
          "choices": [
           {
            "value": "yes",
            "text": {
             "default": "Yes",
             "cs": "Ano"
            }
           },
           {
            "value": "no",
            "text": {
             "default": "No",
             "cs": "Ne"
            }
           }
          ]
         },
         {
          "type": "checkbox",
          "name": "compensatedEmissionsOffsetsType",
          "visibleIf": "{compensatedEmissionsOffsets} = 'yes'",
          "title": {
           "default": "What type of compensation?",
           "cs": "Jaké typy kompenzací?"
          },
          "description": {
           "default": "If you have a company-specific project, please choose \"other\" and add a web link or add information to the last answering option.",
           "cs": "Pokud máte specifický projekt vázaný na vaší společnost, prosím, vyberte \"Jiné\" a uveďte webovou stránku projektu, případně uveďte více informací v závěrečné části dotazníku."
          },
          "requiredIf": "{compensatedEmissionsOffsets} = 'yes'",
          "choices": [
           {
            "value": "goldStandardCarbonCredits",
            "text": {
             "default": "Gold Standard carbon credits",
             "cs": "Gold Standard uhlíkové kredity"
            }
           },
           {
            "value": "verraVcsCertifiedCredits",
            "text": {
             "default": "Verra VCS certified credits",
             "cs": "Verry VCS certifikované kredity"
            }
           },
           {
            "value": "renewableEnergyCertificates",
            "text": {
             "default": "Renewable Energy Certificates (REC)",
             "cs": "Certifikáty obnovitelné energie (REC)"
            }
           },
           {
            "value": "treePlantingProject",
            "text": {
             "default": "Tree planting project",
             "cs": "Projekt na výsadbu stromů"
            }
           },
           {
            "value": "purchasedProjectBasedCarbonCredits",
            "text": {
             "default": "Purchased project-based carbon credits",
             "cs": "Zakoupené projektové uhlíkové kredity"
            }
           }
          ],
          "showOtherItem": true,
          "otherText": {
           "default": "Other (describe)",
           "cs": "Jiné (popište)"
          }
         },
         {
          "type": "text",
          "name": "compensatedEmissionsOffsetsNumberCompensated",
          "visibleIf": "{compensatedEmissionsOffsets} = 'yes'",
          "title": {
           "default": "How much was compensated?",
           "cs": "Kolik jste kompenzovali?"
          },
          "description": {
           "default": "metric tonnes CO2e",
           "cs": "metrické tuny ekvivalentu CO2"
          },
          "requiredIf": "{compensatedEmissionsOffsets} = 'yes'",
          "inputType": "number",
          "inputMask": "decimal"
         }
        ],
        "title": {
         "default": "Sequestered & compensated emissions",
         "cs": "Sekvestrované a kompenzované emise"
        }
       },
       {
        "name": "closing",
        "elements": [
         {
          "type": "comment",
          "name": "comments",
          "title": {
           "default": "Please share here any explanation of missing data, changes or differences versus previously reported data or scope, or any other point for our attention",
           "cs": "Prosím, sdělte nám zde vysvětlení pro případná chybějící data, změny a rozdíly s předchozím vykazováním, popřípadě jakékoliv další informace, které by nám neměly uniknout"
          },
          "hideNumber": true
         },
         {
          "type": "panel",
          "name": "approval",
          "elements": [
           {
            "type": "text",
            "name": "nameOfApproval",
            "title": {
             "default": "Name",
             "cs": "Jméno"
            },
            "hideNumber": true,
            "isRequired": true,
            "autocomplete": "name"
           },
           {
            "type": "text",
            "name": "dateOfApproval",
            "startWithNewLine": false,
            "title": {
             "default": "Date",
             "cs": "Datum"
            },
            "hideNumber": true,
            "isRequired": true,
            "inputType": "date",
            "min": "2023-05-01"
           }
          ],
          "title": {
           "default": "Approval",
           "cs": "Schválení"
          },
          "description": {
           "default": "By entering the name and date, you indicate that you have completed this form truthfully.",
           "cs": "Vložením svého jména a data potvrzujete pravdivost údajů uvedených v dotazníku."
          }
         }
        ],
        "title": {
         "default": "Closing",
         "cs": "Závěr"
        }
       }
      ],
      "checkErrorsMode": "onValueChanged"
     }
    this.json = json;
  }

  applyAnswer(){
    this.surveyModel.data = JSON.parse(this.ansJson);
  }
}
