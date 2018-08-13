(function () {
    'use strict';
	khaled
    var AssetController = ['$scope', '$location', '$rootScope', 'assetService', 'baseService', '$http',
        '$q', '$stateParams', '$window', '$state', '$filter', 'authService', 'dialogs', '$timeout', '$datepicker', '$timepicker', '$controller', 'dmp',
        function ($scope, $location, $rootScope, assetService, baseService, $http,
            $q, $stateParams, $window, $state, $filter, authService, dialogs, $timeout, $datepicker, $timepicker, $controller, dmp) {

            // instantiate base controller with self $scope
            $controller('baseController', { $scope: $scope });

            /* ******************* Global Variables ******************* */
            $rootScope.lstSelectedHomeLaguages = [];
            $rootScope.lstSelectedCreateAssetLaguages = [];
            $rootScope.LoginUserData = [];
            $rootScope.lstHomeDropdownLanguage = [];
            $rootScope.lstDropdownCreateAssetLanguage = [];
            $rootScope.uploadAssetsApprovalLanguages = [];
            $rootScope.sendToTranslationLanguages = [];
            $rootScope.SetToNotApprove = false;
            $rootScope.Showpreloader = true;
            $rootScope.SrpLoading = false;
            $rootScope.username = localStorage.getItem('username');

            /* ******************* Private Variables ******************* */
            $scope.lblCategory = 'All Categories';
            $scope.uploadAssetsModel = {};
            $scope.sendToTranslationModel = {};            
            $scope.lstlanguagesshortname = [];
            $scope.lstsearchresult = [];
            $scope.Category = 'all';
            $scope.SubCategory = 'all';
            $scope.lstPermission = [];
            $scope.SearchText = "";
            $scope.triggerId = ""
            $scope.TotalSearch = 1;
            $scope.lstHomeDL = null;
            $scope.lstCreateDL = null;
            $scope.active = true;
            $scope.show = true;
            var vm = this;
            vm.returnUrl = $stateParams.returnUrl;     // $stateParams.returnUrl MUST be route-name defined in ui-route-definition within loginDemo.js


            var init = function () {
                //load system setup data
                $rootScope.LoadSystemSetup();

                //Application User Init
                $rootScope.ApplicationUserInit();

                //get user role permissions
                $rootScope.GetUserWiseRolePermission($state.current.name);

                //get profile pic in header..
                $rootScope.UploadProfilePic();
            };

            CKEDITOR.config.customConfig = "../../scripts/CkeditorCustomConfig.js";

            //Get Language List
            $scope.GetMainlanguageList = function () {
                $scope.GetData('Assets', 'userlanguages', null)
                    .then(function success(response1) {
                        if (response1.data.languages) {
                            $scope.LanguageList = response1.data;
                            var defaultLang = $.grep($scope.LanguageList.languages, function (b) {
                                return b.isdefaultlanguage === true;
                            });
                            var defaultlangobjlocal = JSON.parse(localStorage.getItem('defaultLanguage'));

                            //Check language list change or not
                            if (angular.equals(defaultlangobjlocal, defaultLang)) {
                                if (localStorage.getItem('userData') != null && localStorage.getItem('userData') != "") {
                                    //bind selected language of logged in user in home/createasset
                                    var objUserData = JSON.parse(localStorage.getItem('userData'));
                                    for (var i = 0; i < objUserData.length; i++) {
                                        if (objUserData[i].username == $scope.username) {
                                            $rootScope.lstSelectedHomeLaguages = objUserData[i].selectedHomeLanguage;
                                            $rootScope.lstSelectedCreateAssetLaguages = objUserData[i].selectedCreateAssetLanguage;
                                        }
                                    }

                                    //bind home language dropdown
                                    $rootScope.lstHomeLanguage = $scope.LanguageList.languages;
                                    angular.forEach($scope.lstSelectedHomeLaguages, function (lang, index) {
                                        var homeDropLangObj = $.grep($rootScope.lstHomeLanguage, function (b) {
                                            return b.id == lang.id;
                                        });

                                        if (homeDropLangObj.length > 0) {
                                            var index = $rootScope.lstHomeLanguage.indexOf(homeDropLangObj[0]);
                                            $rootScope.lstHomeLanguage.splice(index, 1);
                                        }

                                        $rootScope.lstHomeDropdownLanguage = $rootScope.lstHomeLanguage;
                                    });
                                    if ($scope.lstSelectedHomeLaguages.length == 0) {
                                        $rootScope.lstHomeDropdownLanguage = $rootScope.lstHomeLanguage;
                                    }

                                    //bind create asset language dropdown
                                    $rootScope.lstCreateAssetLanguage = $scope.LanguageList.languages;
                                    angular.forEach($scope.lstSelectedCreateAssetLaguages, function (lang, index) {
                                        var createDropLangObj = $.grep($rootScope.lstCreateAssetLanguage, function (b) {
                                            return b.id == lang.id;
                                        });

                                        if (createDropLangObj.length > 0) {
                                            var index = $rootScope.lstCreateAssetLanguage.indexOf(createDropLangObj[0]);
                                            $rootScope.lstCreateAssetLanguage.splice(index, 1);
                                        }

                                        $rootScope.lstDropdownCreateAssetLanguage = $rootScope.lstCreateAssetLanguage;
                                    });
                                    if ($scope.lstSelectedCreateAssetLaguages.length == 0) {
                                        $rootScope.lstDropdownCreateAssetLanguage = $rootScope.lstCreateAssetLanguage;
                                    }
                                }
                                else {
                                    $rootScope.lstDropdownCreateAssetLanguage = $scope.LanguageList.languages;
                                    $rootScope.lstHomeDropdownLanguage = $scope.LanguageList.languages;
                                }
                            }
                            else {
                                localStorage.setItem("defaultLanguage", JSON.stringify(defaultLang));
                                $rootScope.lstDropdownCreateAssetLanguage = $scope.LanguageList.languages;
                                $rootScope.lstHomeDropdownLanguage = $scope.LanguageList.languages;
                                localStorage.setItem("userData", "");
                            }

                        }

                        $rootScope.RefreshSelectPickerOptions();

                        $rootScope.Showpreloader = false;
                    }, function errorCallback(response) {
                        $rootScope.Showpreloader = false;
                        $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                    });
            }



            //Get language list
            $scope.GetlanguageList = function () {
                $scope.GetData('Assets', 'userlanguages', null)
                    .then(function success(response) {
                        if (response.data != "") {
                            $scope.AssetLanguageList = response.data;
                        }
                        else {
                            $scope.AssetLanguageList = [];
                        }
                        $rootScope.RefreshSelectPickerOptions();
                        $rootScope.Showpreloader = false;
                    }, function errorCallback(response) {
                        $rootScope.Showpreloader = false;
                        $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                    });
            }

            //select category
            $scope.SelectedCategory = function (value, type, category, sub1, sub2, sub3) {
                $scope.lblCategory = value;
                switch (type) {
                    case 'All':
                        $scope.Category = 'all';
                        $scope.SubCategory = 'all';
                        break;
                    case 'Category':
                        $scope.Category = value;
                        $scope.SubCategory = 'all';
                        break;
                    case 'SubCategory':
                        var subcategory = '';
                        var plaintextsub1 = htmlToPlaintext(sub1);
                        var plaintextsub2 = htmlToPlaintext(sub2);
                        var plaintextsub3 = htmlToPlaintext(sub3);
                        if (sub3 != '') {
                            subcategory = plaintextsub1 + "::" + plaintextsub2 + "::" + plaintextsub3;
                        }
                        else if (sub2 != '') {
                            subcategory = plaintextsub1 + "::" + plaintextsub2;
                        }
                        else {
                            subcategory = plaintextsub1;
                        }
                        $scope.Category = category;
                        $scope.SubCategory = subcategory;
                        break;
                    default:
                }
            }

            //call when user select language
            $scope.AddSelectedHomeLanguages = function (objlang) {

                if (objlang != null) {
                    objlang = JSON.parse(objlang);
                    clearLanguageFilterText();
                    //Add language in selected language list
                    if ($rootScope.lstSelectedHomeLaguages.length < 4) {
                        var index = -1;
                        $scope.lstHomeDropdownLanguage.filter(function (language) {
                            if (language.shortname == objlang.shortname && language.longname == objlang.longname) {
                                index = $scope.lstHomeDropdownLanguage.indexOf(language);
                            }
                        });

                        $scope.lstHomeDropdownLanguage.splice(index, 1);
                        $rootScope.lstSelectedHomeLaguages.push(objlang);
                        $rootScope.RefreshSelectPickerOptions();
                    }
                    else {
                        $scope.lstHomeDL = null;
                        $rootScope.AlertMessageBox("You can't add more than 4 language at a time", 'Warning', 'warning');
                    }

                    // Local storage - Operation
                    if (localStorage.getItem('userData') == undefined || localStorage.getItem('userData') == "" || localStorage.getItem('userData') == null) {
                        var userData = {
                            username: $scope.username,
                            selectedHomeLanguage: $rootScope.lstSelectedHomeLaguages,
                            selectedCreateAssetLanguage: $rootScope.lstSelectedCreateAssetLaguages
                        }
                        $rootScope.LoginUserData.push(userData);
                        localStorage.setItem("userData", JSON.stringify($rootScope.LoginUserData));
                    }
                    else {
                        var isUserExistInLocalStorage = false;
                        $rootScope.LoginUserData = JSON.parse(localStorage.getItem('userData'));
                        for (var i = 0; i < $rootScope.LoginUserData.length; i++) {
                            if ($rootScope.LoginUserData[i].username == $scope.username) {
                                isUserExistInLocalStorage = true;
                                break;
                            }
                            else {
                                isUserExistInLocalStorage = false;
                            }
                        }

                        if (isUserExistInLocalStorage == true) {
                            $rootScope.LoginUserData[i].selectedHomeLanguage = $rootScope.lstSelectedHomeLaguages;
                            $rootScope.LoginUserData[i].selectedCreateAssetLanguage = $rootScope.lstSelectedCreateAssetLaguages;
                            localStorage.setItem("userData", JSON.stringify($rootScope.LoginUserData));
                        }
                        else {
                            var userData = {
                                username: $scope.username,
                                selectedHomeLanguage: $rootScope.lstSelectedHomeLaguages,
                                selectedCreateAssetLanguage: $rootScope.lstSelectedCreateAssetLaguages
                            }
                            $rootScope.LoginUserData.push(userData);
                            localStorage.setItem("userData", JSON.stringify($rootScope.LoginUserData));
                        }
                    }
                }
            }

            //call when user remove selected language
            $scope.RemoveSelectedHomeLanguage = function (value) {
                var index = -1;
                $scope.lstSelectedHomeLaguages.filter(function (language) {
                    if (language.shortname == value.shortname && language.longname == value.longname) {
                        index = $scope.lstSelectedHomeLaguages.indexOf(language);
                    }
                });

                $rootScope.lstSelectedHomeLaguages.splice(index, 1);

                $rootScope.RefreshSelectPickerOptions();
                $rootScope.lstHomeDropdownLanguage.push(value);

                $rootScope.LoginUserData = JSON.parse(localStorage.getItem('userData'));
                for (var i = 0; i < $rootScope.LoginUserData.length; i++) {
                    if ($rootScope.LoginUserData[i].username == $scope.username) {
                        $rootScope.LoginUserData[i].selectedHomeLanguage = $rootScope.lstSelectedHomeLaguages;
                        $rootScope.LoginUserData[i].selectedCreateAssetLanguage = $rootScope.lstSelectedCreateAssetLaguages;
                    }
                }
                localStorage.setItem("userData", JSON.stringify($rootScope.LoginUserData));
            }


            //Make dropdown open after select language
            $('body').on('click', '.language-selectpicker div.dropdown-menu ul.dropdown-menu.inner li a', function (event) {
                event.stopPropagation();
            });

            //clear language search textbox
            var clearLanguageFilterText = function () {
                $('.language-selectpicker div.dropdown-menu div.bs-searchbox input[type="text"]').val('');
            };

            $("#btn1").click(function (e) {
                e.preventDefault();
                $(this).toggleClass('active');
                $(".filter-block").stop(true, true).slideToggle();
            });

            $scope.windowScrollVal = 0;
            window.addEventListener("scroll", function (event) {
                $scope.windowScrollVal = window.scrollY;
                $scope.$apply();
            }, false);

            $scope.scrollToTop = function () {
                var that = this;
                var scrollInterval = setTimeout(function () {
                    if (window.scrollY != 0) {
                        window.scrollTo(0, window.scrollY - 150);
                        that.scrollToTop();
                    } else {
                        clearInterval(scrollInterval);
                    }
                }, 10);
            }

            //convert html text in plain text
            function htmlToPlaintext(text) {
                return text ? String(text).replace(/<[^>]+>/gm, '') : '';
            }

            //Get current company Id
            $scope.Getcurrentcompany = function () {
                //$rootScope.Showpreloader = true;
                var deferred = $q.defer();
                $scope.GetData('Assets', 'Currentcompany', { 'username': $rootScope.username })
                    .then(function success(response) {
                        if (response.data != "") {
                            $scope.CurrentCompanyId = response.data;
                            deferred.resolve(true);
                        } else {
                            $rootScope.MultiCustomersList = [];
                            deferred.reject(true);
                        }
                        //$rootScope.Showpreloader = false;
                    }, function errorCallback(response) {
                        //$rootScope.Showpreloader = false;
                        deferred.reject(true);
                        $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                    });
                return deferred.promise;
            };

            $rootScope.Customer = "";
            $scope.GetCustomerlist = function () {
                //$rootScope.Showpreloader = true;
                $scope.GetData('assets', 'multicompanydropdown')
                    .then(function success(response) {
                        if (response.data != "") {
                            $rootScope.MultiCustomersList = response.data;
                            if ($scope.CurrentCompanyId > 0) {
                                var compObj = $.grep($rootScope.MultiCustomersList.customers, function (b) {
                                    return b.keyfield === $scope.CurrentCompanyId;
                                });
                                if (compObj.length != 0) {
                                    $rootScope.Customer = { 'keyfield': compObj[0].keyfield, 'label': compObj[0].label }
                                }
                                $scope.GetMainlanguageList();
                            }
                            else {
                                $rootScope.Customer = "";
                            }
                        } else {
                            $rootScope.MultiCustomersList = [];
                        }
                        //$rootScope.Showpreloader = false;
                    }, function errorCallback(response) {
                        //$rootScope.Showpreloader = false;
                        $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                    });
            };

            $rootScope.UpdateCompany = function (customer) {
                var dlg = null;
                dlg = dialogs.confirm('Warning', 'You are about to change to company ' + customer.label + '. Are you sure you want to do that? ');
                dlg.result.then(function (btn) {
                    $rootScope.Showpreloader = true;
                    $scope.SaveData('assets', 'updateusercompany', { 'username': $rootScope.username, 'companyid': customer.keyfield })
                        .then(function success(response) {
                            $rootScope.Showpreloader = false;
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                        });
                }, function (btn) { });
            }

            //Rights to multicompany role?
            $rootScope.Ismulticompany = false;

            $scope.RightsmulticompanyRole = function () {
                //$rootScope.Showpreloader = true;
                var deferred = $q.defer();
                $scope.GetData('Assets', 'userwithmulticompanyrole')
                    .then(function success(response) {
                        if (response.data === true || response.data === false) {
                            $rootScope.Ismulticompany = response.data;
                            deferred.resolve(true);
                        } else {
                            $rootScope.Ismulticompany = false;
                            deferred.reject(true);
                        }
                        //$rootScope.Showpreloader = false;
                    }, function errorCallback(response) {
                        //$rootScope.Showpreloader = false;
                        deferred.reject(true);
                        $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                    });
                return deferred.promise;
            }

            $scope.RightsmulticompanyRole().then(function () {
                if ($rootScope.Ismulticompany === true) {
                    $scope.Getcurrentcompany().then(function () {
                        $scope.GetCustomerlist();
                    });
                }
                else {
                    $scope.GetMainlanguageList();
                }
            });

            //Update users last action
            $scope.UpdateLastAction = function (assetid, lang) {
                $scope.GetData('assets', 'lastaction', { 'assetid': assetid, 'language': lang })
                    .then(function success(response) {
                        if (response.data != "") {
                            $scope.lastactionresponse = JSON.parse(response.data);
                        }
                    }, function errorCallback(response) {
                        if (response.data != "") {
                            $scope.lastactionresponse = JSON.parse(response.data);
                        }
                    });
            }

            //Update users picture log
            $scope.UpdateUserPictureLog = function () {
                $scope.GetData('general', 'getuserpicturelog', { 'useremail': $rootScope.username })
                    .then(function success(response) {
                        if (response.data != "") {
                            $scope.UserPictureLogresponse = response.data;
                        }
                    }, function errorCallback(response) {
                        if (response.data != "") {
                            $scope.UserPictureLogresponse = response.data;
                        }
                    });
            }

            //Set picture for Actioned User in Histroy Log
            $scope.GetActionUserPic = function (obj, Email) {
                //$rootScope.Showpreloader = true;
                $scope.GetData('general', 'getuserpicturelog', { 'useremail': Email })
                    .then(function success(response) {
                        if (response.data != "") {
                            if (response.data != null) {
                                if (response.data.indexOf("data:image") !== -1) {
                                    obj['UserPicture'] = response.data;
                                }
                                else {
                                    obj['UserPicture'] = "data:image/jpeg;base64," + response.data;
                                }
                            }
                        }
                        //$rootScope.Showpreloader = false;
                    }, function errorCallback(response) {
                        if (response.data != "") {
                            obj['UserPicture'] = null;
                            //$rootScope.Showpreloader = false;
                        }
                    });
            }

            //Display Image according to changes/action done
            $scope.ImageDisplayofActionUser = function (obj) {
                if (obj != null) {
                    for (var i = 0; i < obj.length; i++) {
                        if (obj[i].changeinfo != null) {
                            if (obj[i].changeinfo[0].UserPicture == undefined) {
                                var changeinfolength = obj[i].changeinfo.length;
                                $scope.GetActionUserPic(obj[i].changeinfo[changeinfolength - 1], obj[i].changeinfo[changeinfolength - 1].lastactionemail);
                            }
                        }
                    }
                }
            };

            //Process the search result JSON
            $scope.ProcessOnSearchResult = function (searchResult, languageShortName) {
                var sourceDecApp = false;
                var sourceHeaderApp = false;

                if (searchResult.hits == "0" || searchResult.Hits == "undefined") {
                    $rootScope.Showpreloader = false;
                }
                else {
                    $scope.TotalSearch = searchResult.Hits[0].hits;

                    //loop over each asset of the search result
                    for (var i = 0; i <= searchResult.Hits[0].asset.length - 1; i++) {

                        var obj = searchResult.Hits[0].asset[i];

                        //Check its UID or not (what is this?)
                        var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
                        if (regexGuid.test(searchResult.Hits[0].asset[i].assetdescription)) {
                            searchResult.Hits[0].asset[i].assetdescription = " ";
                        }

                        //loop over each selected language
                        for (var j = 0; j <= languageShortName.length - 1; j++) {

                            //if the none-translateable-fields (assetfields) list is available
                            if (searchResult.Hits[0].asset[i].assetfields != undefined) {

                                //loop over each none-translateable field
                                for (var m = 0; m < searchResult.Hits[0].asset[i].assetfields.length; m++) {

                                    var assetobj = searchResult.Hits[0].asset[i].assetfields[m];

                                    //if assetfield type is date
                                    if ($filter('lowercase')(assetobj.fieldtype) == "date" && searchResult.Hits[0].asset[i].assetfields[m].value != "") {
                                        if (searchResult.Hits[0].asset[i].assetfields[m].formatting != null && searchResult.Hits[0].asset[i].assetfields[m].formatting != undefined) {
                                            if (searchResult.Hits[0].asset[i].assetfields[m].formatting[0].datetime_showdatepicker == true && searchResult.Hits[0].asset[i].assetfields[m].formatting[0].datetime_showtimepicker == true) {
                                                assetobj['assetTooltip'] = "dd-mm-yyyy (GMT)";
                                                assetobj['assetValue'] = $filter('date')(searchResult.Hits[0].asset[i].assetfields[m].value, "dd-MM-yyyy HH:00");
                                            } else {
                                                assetobj['assetTooltip'] = "dd-mm-yyyy";
                                                assetobj['assetValue'] = $filter('date')(searchResult.Hits[0].asset[i].assetfields[m].value, "dd-MM-yyyy");
                                            }
                                        }
                                    }
                                    else if ($filter('lowercase')(assetobj.fieldtype) == "auto-propagated" && searchResult.Hits[0].asset[i].assetfields[m].value != "") {
                                        assetobj['assetTooltip'] = "";
                                        assetobj['assetValue'] = searchResult.Hits[0].asset[i].assetfields[m].value.split('%2B').join('+');
                                    }
                                    else {
                                        assetobj['assetTooltip'] = "";
                                        assetobj['assetValue'] = searchResult.Hits[0].asset[i].assetfields[m].value.split('%%"').join('"');
                                    }
                                }
                            }

                            /*

                            */
                            $scope.Createbutton = [];
                            var addToArray = true;
                            if (searchResult.Hits[0].asset[i].translations != undefined) {

                                //loop over each asset-translation object
                                for (var k = 0; k < searchResult.Hits[0].asset[i].translations.length; k++) {

                                    var transitem = searchResult.Hits[0].asset[i].translations[k];

                                    if (searchResult.Hits[0].asset[i].translations[k].langshort == languageShortName[j].Name) {
                                        addToArray = false;
                                    }
                                    if (searchResult.Hits[0].asset[i].translations[k].translationfields != undefined) {

                                        //loop over each tranlsation-fields of the current asset-translation-object
                                        for (var l = 0; l < searchResult.Hits[0].asset[i].translations[k].translationfields.length; l++) {

                                            //what is this?
                                            searchResult.Hits[0].asset[i].translations[k].translationfields[l].value = searchResult.Hits[0].asset[i].translations[k].translationfields[l].value.split('%%"').join('"');

                                            var objitem = searchResult.Hits[0].asset[i].translations[k].translationfields[l];

                                            if (objitem.fieldtype == "Date") {
                                                if (searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting != null && searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting != undefined) {
                                                    if (searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting[0].datetime_showdatepicker == true && searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting[0].datetime_showtimepicker == true) {
                                                        objitem['dateTooltip'] = "dd-mm-yyyy (GMT)";
                                                    } else {
                                                        objitem['dateTooltip'] = "dd-mm-yyyy";
                                                    }
                                                }
                                            } else {
                                                objitem['dateTooltip'] = "";
                                            }

                                            //Covert asset html text value into plain text
                                            var plaintext = htmlToPlaintext(searchResult.Hits[0].asset[i].translations[k].translationfields[l].value);
                                            objitem['PlainText'] = plaintext.split('%%"').join('"');

                                            //Add FullyConfidential object in translation 
                                            var fullyConfidential = $.grep(searchResult.Hits[0].asset[i].translations[k].translationfields, function (b) {
                                                return b.value !== "TEXTMINDEDCONFIDENTIAL" && $filter('lowercase')(b.tmkeyfield) !== "product name";
                                            });
                                            transitem['FullyConfidential'] = fullyConfidential.length != 0 ? false : true;

                                            //Add NotConfidential object in translation 
                                            var fullyNotConfidential = $.grep(searchResult.Hits[0].asset[i].translations[k].translationfields, function (b) {
                                                return b.value === "TEXTMINDEDCONFIDENTIAL";
                                            });
                                            transitem['FullyNotConfidential'] = fullyNotConfidential.length != 0 ? false : true;

                                            //Get relations
                                            if (!searchResult.Hits[0].asset[i].translations[k].FullyConfidential && searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting != null && searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting != undefined) {
                                                if (searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting[0].relation_type != null && searchResult.Hits[0].asset[i].translations[k].translationfields[l].formatting[0].relation_type != undefined) {
                                                    searchResult.Hits[0].asset[i].translations[k].translationfields[l].relations = $scope.GetData('assets', 'getrelations', { assetValueId: searchResult.Hits[0].asset[i].translations[k].translationfields[l].id }).then(function success(response) {
                                                        return response.data;
                                                    });
                                                }
                                            }

                                            if ($filter('lowercase')(searchResult.Hits[0].asset[i].translations[k].translationfields[l].tmkeyfield) == "product name") {
                                                var objproductname = {
                                                    Field: searchResult.Hits[0].asset[i].translations[k].translationfields[l].tmkeyfield,
                                                    Value: searchResult.Hits[0].asset[i].translations[k].translationfields[l].value.split('%%"').join('"'),
                                                    FieldId: searchResult.Hits[0].asset[i].translations[k].translationfields[l].id,
                                                    Lang: searchResult.Hits[0].asset[i].translations[k].translationfields[l].lang,
                                                    PlainText: plaintext,
                                                    SourceValue: searchResult.Hits[0].asset[i].translations[k].translationfields[l].sourcevalue,
                                                    HasComment: searchResult.Hits[0].asset[i].translations[k].translationfields[l].hascomment,
                                                    CommentUsername: searchResult.Hits[0].asset[i].translations[k].translationfields[l].commentusername,
                                                    CommentDate: searchResult.Hits[0].asset[i].translations[k].translationfields[l].commentdate,
                                                    ConfidentialityLevel: searchResult.Hits[0].asset[i].translations[k].translationfields[l].confidentialitylevel,
                                                    Comment: searchResult.Hits[0].asset[i].translations[k].translationfields[l].comment,
                                                    NonEditable: searchResult.Hits[0].asset[i].translations[k].translationfields[l].noneditablefrontend
                                                }
                                                transitem['ProductName'] = objproductname;
                                            }

                                            //Header approve/ unapprove tooltips
                                            if (transitem.headerapprovedby == "" && objitem.noneditablefrontend != "0") {
                                                transitem['HeaderApprovalTooltip'] = "Not approved. Click to approve name";
                                            } else if (transitem.headerapprovedby == "" && objitem.noneditablefrontend == "0") {
                                                transitem['HeaderApprovalTooltip'] = "Name not approved";
                                            } else {
                                                transitem['HeaderApprovalTooltip'] = "Header is approved by " + transitem.headerapprovedshortname;
                                            }

                                            //Description approve/ unapprove tooltips
                                            if (transitem.bodyapprovedby == "" && objitem.noneditablefrontend != "0") {
                                                transitem['DescriptionApprovalTooltip'] = "Not approved. Click to approve description";
                                            } else if (transitem.bodyapprovedby == "" && objitem.noneditablefrontend == "0") {
                                                transitem['DescriptionApprovalTooltip'] = "Description not approved";
                                            } else {
                                                transitem['DescriptionApprovalTooltip'] = "Description is approved by " + transitem.bodyerapprovedshortname;
                                            }

                                            for (var m = 0; m < languageShortName.length; m++) {
                                                if (searchResult.Hits[0].asset[i].translations[k].translationfields[l].lang == languageShortName[m].Name) {
                                                    transitem['LanguageOrder'] = languageShortName[m].Order;
                                                    transitem['Createbutton'] = false;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (addToArray) {
                                var LanguageOrder = "";
                                for (var m = 0; m < languageShortName.length; m++) {
                                    if (languageShortName[j].Name == languageShortName[m].Name) {
                                        LanguageOrder = languageShortName[m].Order;
                                    }
                                }
                                var selectedLanguages = {
                                    ShortName: languageShortName[j].Name,
                                    LongName: languageShortName[j].LangName,
                                    LanguageOrder: LanguageOrder,
                                    Createbutton: true
                                };

                                if (searchResult.Hits[0].asset[i].translations != undefined) {
                                    searchResult.Hits[0].asset[i].translations.push(selectedLanguages);
                                }
                                else {
                                    obj['translations'] = [];
                                    searchResult.Hits[0].asset[i].translations.push(selectedLanguages);
                                }
                            }
                        }

                        $rootScope.SrpLoading = false;
                        if ($scope.searchTimerStart != undefined) {

                            $scope.searchTimerEnd = new Date();
                            var searchTimeDiff = $scope.searchTimerEnd - $scope.searchTimerStart;

                            //convert into ms
                            searchTimeDiff /= 1000;

                            //round it to 2 decimal points
                            $scope.searchTime = Math.round(searchTimeDiff * 100) / 100;
                        }
                    }
                }
                if ($scope.triggerId != "") {
                    $scope.triggerClick($scope.triggerId);
                }
                $rootScope.Showpreloader = false;

                return searchResult;
            }; //$scope.ProcessOnSearchResult end


            //Home start
            if ($state.current.name == "Home") {
                $scope.pageSize = 10;
                $scope.AssetPaggingOption = [10, 25, 50, 100];
                $scope.CaseSensitive = { checked: false };
                $scope.ApprovalStatus = "all";
                $scope.EditRequest = "all";
                $scope.ChangePeriod = "all";
                $scope.Lifecycle = { "key": "all", "label": "All" };
                $scope.Confidentiality = "all";
                $scope.SearchRightToLeft = { checked: false };

                $scope.LiveSearch = function (userInputString, timeoutPromise) {
                    var languageCodes = $rootScope.ConvertArrayToString($scope.lstSelectedHomeLaguages, 'shortname', ',');

                    var urlParameters = {
                        'query': userInputString,
                        'category': $scope.Category,
                        'subCategories': $scope.SubCategory,
                        'languageCodes': languageCodes,
                        'take': 20
                    };

                    return $scope.GetData('assets', 'usersearchlive', urlParameters, timeoutPromise)
                        .then(function (response) {
                            var result = {
                                data: {
                                    results: response.data
                                }
                            };

                            return result;
                        });
                }

                $scope.updateSearchString = function (input) {
                    $rootScope.searchtext = input;
                }

                $scope.selectionMade = function (input) {
                    if (input !== undefined) {
                        $scope.updateSearchString(input.title);
                    }
                }

                //Trigger for launching a search
                $rootScope.SearchData = function (searchtext, triggerFlag, resetPaging = true) {

                    //what is this?
                    if (triggerFlag) {
                        $scope.triggerId = "";
                    }

                    //if searchtext is not already saved in the $rootscope overwrite the searchtext param with *
                    searchtext = $rootScope.searchtext;
                    if (searchtext == undefined) {
                        searchtext = "*";
                    }

                    $scope.SearchText = searchtext;
                    $rootScope.Showpreloader = true;
                    $rootScope.SrpLoading = true;

                    $scope.searchTime = 0;
                    $scope.searchTimerStart = new Date();

                    //if no langs are selected alert the user
                    $scope.lstsearchresult = [];
                    $scope.lstlanguagesshortname = [];
                    if ($rootScope.lstSelectedHomeLaguages.length == 0) {
                        $rootScope.AlertMessageBox("You have to choose at least one language.", 'warning', 'warning');
                        //$rootScope.UserAlert("You have to choose at least one language.", "warning");
                        $rootScope.Showpreloader = false;
                        return false;
                    }

                    //collect the shortname and longname of each selected language and give them an ordering value
                    for (var i = 0; i < $rootScope.lstSelectedHomeLaguages.length; i++) {
                        var shortName = {
                            Order: $scope.lstlanguagesshortname.length + 1,
                            Name: $rootScope.lstSelectedHomeLaguages[i].shortname,
                            LangName: $rootScope.lstSelectedHomeLaguages[i].longname
                        }
                        $scope.lstlanguagesshortname.push(shortName);
                    }

                    //create a comma seperated string of the selected languages shortnames (like da-dk, en-us etc)
                    var langauges = $rootScope.ConvertArrayToString($scope.lstlanguagesshortname, 'Name', ',');

                    if (resetPaging === true) {
                        $rootScope.Pagging.currentPage = 1;
                    }

                    var modelObject = {
                        'searchstring': searchtext,
                        'languages': langauges,
                        'categories': $scope.Category,
                        'subcategories': $scope.SubCategory,
                        'caseSensitive': $scope.CaseSensitive.checked,
                        'Approval': $scope.ApprovalStatus,
                        'Comment': $scope.EditRequest,
                        'Period': $scope.ChangePeriod,
                        'lifecycle': $scope.Lifecycle.key,
                        'pagenumber': $rootScope.Pagging.currentPage ? $rootScope.Pagging.currentPage : 1,
                        'rowstoreturn': $rootScope.Pagging.itemsPerPage ? $rootScope.Pagging.itemsPerPage : 100,
                        'confidentialityfilter': $scope.Confidentiality
                    };

					hunk1
                    //Update the url/state without reloading the view for deeplinking
                    $state.go($state.current,
                        {
                            q: modelObject.searchstring,
                            langs: modelObject.languages,
                            cats: modelObject.categories,
                            subcats: modelObject.subcategories,
                            casesensitive: modelObject.caseSensitive,
                            approvalstatus: modelObject.Approval,
                            comment: modelObject.Comment,
                            changeperiod: modelObject.Period,
                            lifecycle: modelObject.lifecycle,
                            confidentiality: modelObject.confidentialityfilter
                        });

                    //call the search API 
                    var GetSearchResult = $scope.GetData('assets', 'usersearchpaging', modelObject)
                        .then(function success(response4) {
                            if (JSON.parse(response4.data).Status != undefined) {
                                $rootScope.AlertMessageBox(JSON.parse(response4.data).failurereason, 'Failure', 'failure');
                                $rootScope.Showpreloader = false;
                            }
                            if (response4.data != "" && JSON.parse(response4.data).Status == undefined) {
                                //send the returned JSON and the array of selected languages to further processing before view
                                $scope.lstsearchresult = $scope.ProcessOnSearchResult(JSON.parse(response4.data), $scope.lstlanguagesshortname);

                                //if any search-filter is active, inform the user about it
                                if( $scope.CaseSensitive.checked || 
                                    $scope.ApprovalStatus !== 'all' || 
                                    $scope.EditRequest !== 'all' ||
                                    $scope.ChangePeriod !== 'all' ||
                                    $scope.Lifecycle.key !== 'all' ||
                                    $scope.Confidentiality !== 'all'){                       
                                        $rootScope.UserAlert("Please note that one or more search filters are active", "info", 7000);
                                }
                            } else {
                                $scope.lstsearchresult = [];
                                $rootScope.Showpreloader = false;
                            }
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                        });
                } //search end

                //Launches a search from URL/deeplink
                if ($stateParams.langs) {

                    //set the searchtext in the rootscope which is used by the SearchData()
                    $rootScope.searchtext = $stateParams.q ? $stateParams.q : "";

                    $scope.Category = $stateParams.cats ? $stateParams.cats : "all";
                    $scope.SubCategory = $stateParams.subcats ? $stateParams.subcats : "all";
                    $scope.CaseSensitive = $stateParams.casesensitive ? { "checked": $stateParams.casesensitive === "true" } : { "checked": false };
                    $scope.ApprovalStatus = $stateParams.approvalstatus ? $stateParams.approvalstatus : "all";
                    $scope.EditRequest = $stateParams.comment ? $stateParams.comment : 'all';
                    $scope.ChangePeriod = $stateParams.changeperiod ? $stateParams.changeperiod : "all";
                    $scope.Lifecycle = $stateParams.lifecycle && $stateParams.lifecycle !== "all" ? { "key": $stateParams.lifecycle, "label": $stateParams.lifecycle } : { "key": "all", "label": "All" };
                    $scope.Confidentiality = $stateParams.confidentiality ? $stateParams.confidentiality : "all";

                    //clear previously selected languages from the language-selector and localStorage
                    $rootScope.lstSelectedHomeLaguages.length = 0;
                    localStorage.setItem("defaultLanguage", JSON.stringify({ username: "", selectedHomeLanguage: [] }));

                    //wait until the languagelist is available
                    var langListWatcher = $rootScope.$watch("lstHomeDropdownLanguage", function () {

                        //only when the LanguageList is set properly
                        if ($scope.LanguageList && $scope.LanguageList.hasOwnProperty("languages")) {

                            //clear the variable watcher
                            langListWatcher();

                            //$rootScope.SearchData() will clear them again
                            $rootScope.Showpreloader = true;
                            $rootScope.SrpLoading = true;

                            //test to see if the the specified language short-name exists in the languageList only then add it to selector
                            var langArr = $stateParams.langs.split(',');
                            langArr.forEach(function (currParamLang, currParamLangIndex) {
                                $scope.LanguageList.languages.forEach(function (currListLang, currListLangIndex) {

                                    if (currParamLang == currListLang.shortname) {
                                        //add the current language to the selected languages
                                        $scope.AddSelectedHomeLanguages(JSON.stringify(currListLang));

                                        delete langArr[currParamLangIndex];
                                    }
                                });
                            });

                            //each currParamLang that was not a valid language short-name show a warning
                            langArr.forEach(function (currLang) {
                                //$rootScope.AlertMessageBox("Unvalid language code " + currLang, 'Warning', 'warning');
                                alert("Invalid language code: " + currLang);
                            });

                            //launch the search
                            $rootScope.SearchData();
                        }
                    });
                }

                $scope.toggleSubCategories = function (event) {
                    $(event.srcElement).parent("li").toggleClass("visible-subcats").find("ul").first().slideToggle()
                };

                $scope.printoutJson = function (elm) {
                    console.log(JSON.stringify(elm));
                };

                $scope.toggleConfidential = function (unlock, rowNumber, transIndex) {

                    if (unlock) {
                        $scope.lstsearchresult.Hits[0].asset[rowNumber].translations[transIndex]['unlockConfidential'] = true;
                    } else {
                        $scope.lstsearchresult.Hits[0].asset[rowNumber].translations[transIndex]['unlockConfidential'] = false;
                    }
                };

                $scope.toggleMetaDataCol = function(){
                    //$("#search-result-wrapper").toggleClass("hide-metadata-col");
                    $(".metadata-wrapper").slideToggle(400);
                    $("#hide-metadata-col-button, #show-metadata-col-button").toggle();  
                };

                //Get category dropdown with rights
                $scope.GetUserRightCategory = function () {
                    var deferred = $q.defer();
                    $scope.GetData('assets', 'userrightsofsubcategory', { 'username': $scope.username })
                        .then(function success(response) {
                            if (response.data != "") {
                                $scope.UserRightCategoryList = response.data;
                                $rootScope.lstcategory = response.data;
                                deferred.resolve(true);
                            } else {
                                $scope.UserRightCategoryList = [];
                                deferred.reject(true);
                            }
                        }, function errorCallback(response) {
                            if (response.data != "") {
                                $scope.UserRightCategoryList = [];
                                deferred.reject(true);
                            }
                        });
                    return deferred.promise;
                }
                $scope.GetUserRightCategory();


                $scope.assetUncheckAll = function () {
                    //uncheck all selected assets
                    $(".asset-checker:checkbox").each(function () {
                        this.checked = false;
                        //this.removeAttribute("checked");
                    });
                    $scope.assetCheckEvent(0);
                };
                $scope.assetCheckAll = function () {
                    $(".asset-checker:checkbox").each(function () {
                        this.checked = true;
                        //this.setAttribute("checked", "checked");
                    });
                    $scope.assetCheckEvent(0);
                };

                $scope.assetCheckEvent = function (assetId) {

                    //console.log(assetId);

                    $scope.checkedAssetIds = [];
                    $('.asset-checker:checkbox:checked').each(function () {
                        $scope.checkedAssetIds.push($(this).val());
                    });

                    //console.log( $scope.checkedAssetIds.join() );
                };

                // Download asset button
                $scope.loadDownloadAsset = function () {
                    $scope.showAssetSelection = false;
                    $scope.AssetDownloadFormate = [];

                    //used as ng-model in Modal.Download-Asset.html
                    $scope.SelectedAssetLanguage = "";

                    $scope.SelectedDownloadFormate = "";
                    $rootScope.RefreshSelectPickerOptions();

                    //fill language drop-down
                    $scope.GetlanguageList();
                    $scope.SelectedAssetLanguage = $scope.lstSelectedHomeLaguages;
                    $rootScope.RefreshSelectPickerOptions();

                    //asset ids for download search result
                    if ($scope.checkedAssetIds != null && $scope.checkedAssetIds.length != 0) {
                        $scope.AssetIds = $scope.checkedAssetIds.join(',');
                    } else {
                        $scope.AssetIds = $scope.lstsearchresult.Hits[0].assetIds;
                    }

                    var count = $scope.AssetIds.split(",").length;

                    if (count > 250) {
                        $rootScope.AlertMessageBox("You are trying to download " + count + " assets, but 250 is the maximum number of assets that can be downloaded at once. Please refine your search to get a search result with less than 250 assets, or select the assets that you wish to download.", 'Warning', 'warning');
                        return;
                    }

                    //fill download formate dropdown
                    $scope.GetData('assets', 'GetDownloadFormats', null)
                        .then(function success(response) {
                            $scope.AssetDownloadFormate = response.data;
                            $rootScope.RefreshSelectPickerOptions();
                            $('#modalDownloadAsset').modal('show');
                        }, function errorCallback(response) {
                            $scope.AssetDownloadFormate = [];
                            $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                        });
                }

                $scope.DownloadExistingAssets = function (SelectedAssetLanguage, AssetDownloadFormate) {
                    $rootScope.Showpreloader = true;
                    if ((SelectedAssetLanguage == null || SelectedAssetLanguage.length == 0) || (AssetDownloadFormate == null || AssetDownloadFormate.length == 0)) {
                        $rootScope.Showpreloader = false;
                        var msg = ((SelectedAssetLanguage == null || SelectedAssetLanguage.length == 0) ? "language, " : "") + ((AssetDownloadFormate == null || AssetDownloadFormate.length == 0) ? "format" : "");
                        $rootScope.AlertMessageBox("Please select " + msg, 'Warning', 'warning');
                    } else {
                        var languageCodes = $rootScope.ConvertArrayToString(SelectedAssetLanguage, 'shortname', ',');
                        $scope.DownloadData('assets', 'DownloadAssets', { 'format': AssetDownloadFormate.Key, 'assetIds': $scope.AssetIds, 'languageCodes': languageCodes })
                            .then(function success(response) {
                                $rootScope.Showpreloader = false;
                                var filename = response.headers('Filename');
                                var blob = new Blob([response.data], {});
                                saveAs(blob, filename);
                                $('#modalDownloadAsset').modal('hide');
                            }, function errorCallback(response) {
                                $rootScope.Showpreloader = false;
                                $rootScope.AlertMessageBox(response.data.ExceptionMessage, 'Failure', 'failure');
                            });
                    }

                    //uncheck all selected assets after download completes
                    $scope.assetUncheckAll();
                }

                $scope.DownloadExistingAssetsCancel = function () {
                    $rootScope.RefreshSelectPickerOptions();
                }

                // UploadAssets
                $scope.LoadSendToTranslation = function () {
                    $scope.GetData('assets', 'GetSendToTranslationLanguages').then(function (response) {
                        $scope.sendToTranslationLanguages = response.data;
                        $rootScope.RefreshSelectPickerOptions();
                    });

                    $scope.sendToTranslationModel.projectName = "";
                    $scope.sendToTranslationModel.targets = [];
                    $scope.sendToTranslationModel.separateFiles = false;

                    $rootScope.RefreshSelectPickerOptions();
                }

                $scope.SendToTranslation = function () {
                    var errors = [];

                    if ($scope.sendToTranslationModel.projectName === "") {
                        errors.push("Project Name");
                    }

                    if ($scope.sendToTranslationModel.targets.length === 0) {
                        errors.push("Target Languages");
                    }

                    if (errors.length) {
                        $rootScope.AlertMessageBox("Please set " + errors.join(" and "), 'Warning', 'warning');
                    } else {
                        $rootScope.Showpreloader = true;

                        var data = {
                            ProjectName: $scope.sendToTranslationModel.projectName,
                            AssetIds: $scope.checkedAssetIds,
                            TargetLanguageCodes: $scope.sendToTranslationModel.targets.map(l => l.LanguageCode),
                            SeparateFiles: $scope.sendToTranslationModel.separateFiles
                        };

                        $scope.SaveData("ManageAssets", "SendToTranslation", null, data, true).then(function (response) {
                            $rootScope.Showpreloader = false;
                            $('#send-assets-to-translation-modal').modal('hide');
                            $rootScope.UserAlert("Assets sent to translation", "success");
                        }, function (error) {
                            $rootScope.Showpreloader = false;
                            $rootScope.AlertMessageBox(error.data.Message, 'Failure', 'failure');
                        });
                    }
                }

                $scope.RelatedAsset;
                $scope.GetRelatedAsset = function (assetId, langCode) {

                    var modelObject = {
                        'assetId': assetId,
                        'languageCodes': langCode,
                    };

                    var GetSearchResult = $scope.GetData('assets', 'GetAsset', modelObject)
                        .then(function success(response) {

                            $rootScope.Showpreloader = false;

                            if (response.data != "") {
                                $scope.RelatedAsset = response.data;
                            } else {
                                $scope.RelatedAsset = "";
                            }
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            $("#singleassetmodal").modal("toggle");
                            $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                        });
                };

                //fill lifecycle dropdown list
                $scope.GetData('assets', 'lifecycle', null)
                    .then(function success(response) {
                        if (response.data != "") {
                            $scope.LifeCycleDropdown = JSON.parse(response.data);
                        } else {
                            $scope.LifeCycleDropdown = {
                                lifecycle: []
                            };
                        }

                        $scope.LifeCycleDropdown.lifecycle.unshift({ "key": "all", "label": "All" });

                        $rootScope.RefreshSelectPickerOptions();
                    }, function errorCallback(response) {
                        $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                    });

                $scope.toggleFullContent = function ($event, accordRowId, propIndex) {
                    //console.log(accordRowId, propIndex);
                    //var $container = $($event.target).closest(".asset-prop-container");

                    var $accordRow = $("#" + accordRowId);
                    var $rowPropContainer = $accordRow.find(".asset-prop-content-container" + "." + propIndex);
                    var $transPropContent = $rowPropContainer.find(".asset-prop-content");

                    //toggle the expand/compress icons
                    $(".has-more-content").closest(".asset-prop-content-container" + "." + propIndex).find(".asset-prop-expand").toggle();
                    $(".has-more-content").closest(".asset-prop-content-container" + "." + propIndex).find(".asset-prop-compress").toggle();

                    //shows/or hides the full content
                    $transPropContent.toggleClass("toggle-full-content");
                };

                $scope.enhanceAccordContent = function (accordOpen, accordRowId) {

                    angular.element(document).ready(function () {
                        var accord = $("#" + accordRowId);

                        if (accordOpen) {
                            var allCols = accord.find(".trans-box-container .sr-box-container");

                            //equalize the same property across the colums
                            var firstCol = allCols.first();
                            //for each prop of the first col
                            firstCol.find(".asset-prop-content-container .asset-prop-content").each(function (i) {
                                var tallestProp = 0;
                                //find the tallest prop in each row
                                allCols.each(function (j) {
                                    var currContent = $(this).find(".asset-prop-content-container .asset-prop-content").get(i);
                                    if (currContent) {
                                        //console.log(currContent);
                                        if (currContent.offsetHeight > tallestProp) {
                                            tallestProp = currContent.offsetHeight;
                                        }
                                    }
                                });

                                if (tallestProp) {
                                    allCols.each(function (j) {
                                        var currContent = $(this).find(".asset-prop-content-container .asset-prop-content").get(i);

                                        //set the tallest prop in each col
                                        $(currContent).css("height", tallestProp);

                                        //only display the "expand" icon for properties which has more content
                                        if (currContent && currContent.offsetHeight > 0) {
                                            var elmContainer = $(currContent).closest(".asset-prop-content-container");
                                            elmContainer.addClass("has-more-content");
                                            elmContainer.find(".asset-prop-compress").css("display", "inline-block");
                                        }
                                    });
                                }
                                //console.log("tallest", tallestProp);
                            });
                        } else {
                            //on accordion collapse outline briefly the clicked row
                            $(accord).toggleClass("outlineRow");
                            setTimeout(function () {
                                $(accord).toggleClass("outlineRow");
                            }, 800);
                        }
                    });
                }

                //trigger the click when asset collapse or expand
                $scope.triggerClick = function (fieldName) {
                    if (fieldName != undefined || fieldName != null || fieldName != "") {
                        setTimeout(function () {
                            document.getElementById(fieldName).click();
                        }, 0);
                    }
                }

                //asset download
                $scope.DownloadAsset = function (fileformate, assetid, assetdescription) {
                    var langauges = $rootScope.ConvertArrayToString($scope.lstlanguagesshortname, 'Name', ',');
                    //get asset data to download
                    $scope.GetData('assets', 'download', { 'assetid': assetid, 'language': langauges })
                        .then(function success(response) {
                            if (response.data != "") {
                                $scope.DownloadData = JSON.parse(response.data);
                            } else {
                                $scope.DownloadData = [];
                            }
                            switch (fileformate) {
                                case 'excel':
                                    $scope.JSONToCSVConvertor($scope.DownloadData, '.xls', assetdescription);
                                    break;
                                case 'csv':
                                    $scope.JSONToCSVConvertor($scope.DownloadData, '.csv', assetdescription);
                                    break;
                                case 'json':
                                    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($scope.DownloadData));
                                    var a = document.createElement('a');
                                    a.href = 'data:' + data;
                                    a.download = assetdescription + '.json';
                                    a.innerHTML = 'download JSON';
                                    a.click();
                                    break;
                                default:
                            }
                        }, function errorCallback(response) {
                            $scope.DownloadData = [];
                        });
                }

                //convert json object into csv/ excel formate
                $scope.JSONToCSVConvertor = function (JSONData, type, title) {
                    var obj = JSONData.Asset;
                    var header = [];
                    var values = [];

                    for (var i = 0; i < obj.length; i++) {
                        for (var prop in obj[i]) {
                            if (obj[i].hasOwnProperty(prop)) {
                                if (prop == "assetvalues") {
                                    for (var j = 0; j < obj[i].assetvalues.length; j++) {
                                        header.push(prop + "_" + j + "_" + obj[i].assetvalues[j].fieldname);
                                        values.push(obj[i].assetvalues[j].value);
                                    }
                                }
                                else if (prop == "languages") {
                                    for (var j = 0; j < obj[i].languages.length; j++) {
                                        for (var inProp in obj[i].languages[j]) {
                                            if (inProp == "languagefields") {
                                                for (var k = 0; k < obj[i].languages[j].languagefields.length; k++) {
                                                    header.push(prop + "_" + j + "_" + inProp + "_" + k + "_" + obj[i].languages[j].languagefields[k].fieldname);
                                                    values.push(obj[i].languages[j].languagefields[k].value);
                                                }
                                            }
                                            else {
                                                header.push(prop + "_" + j + "_" + inProp);
                                                values.push(obj[i].languages[j][inProp]);
                                            }
                                        }
                                    }
                                }
                                else {
                                    header.push(prop);
                                    values.push(obj[i][prop]);
                                }
                            }
                        }
                    }

                    var CSV = '';
                    //append Label row with line break
                    CSV += header.slice(0, -1) + '\r\n';
                    CSV += values.slice(0, -1) + '\r\n';

                    if (CSV == '') {
                        $rootScope.AlertMessageBox("Invalid data", 'Failure', 'failure');
                        return;
                    }

                    //this will remove the blank-spaces from the title and replace it with an underscore
                    //Initialize file format you want csv or xls                 
                    if (type == '.csv') {
                        var uri = 'data:application/vnd.ms-excel,' + encodeURI(CSV);
                    }
                    else {
                        var uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV);
                    }

                    //this trick will generate a temp <a /> tag
                    var link = document.createElement("a");
                    link.href = uri;

                    //set the visibility hidden so it will not effect on your web-layout
                    link.style = "visibility:hidden";
                    link.download = title + type;

                    //this part will append the anchor tag and remove it after automatic click
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                };

                //call when user select image - convert image into base64
                $scope.AssetImageUpload = function (element) {
                    var defer = $q.defer()
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var filename = element.files[0].name;
                        var extension = filename.split('.').pop();
                        var bytearr = e.target.result;
                        if (extension == 'jpg' || extension == 'jpeg') {
                            bytearr = bytearr.replace("data:image/jpeg;base64,", "");
                        }
                        else if (extension == 'png') {
                            bytearr = bytearr.replace("data:image/png;base64,", "");
                        }
                        $scope.Byte = bytearr;
                        $scope.Extension = extension;
                        $scope.FileName = filename;
                        $scope.formdata = new FormData($('#assetimage')[0]);
                        defer.resolve(bytearr);
                    }
                    reader.readAsDataURL(element.files[0]);
                    return defer.promise
                }

                //load image upload modal popup
                $scope.loadUploadImageModalPopup = function (assetid, index, fieldName, active) {
                    $('#uploadassetimg').val('');
                    $('#uploadImage').modal('toggle');
                    $scope.triggerId = fieldName;
                    $scope.AssetID = assetid;
                };

                //Upload asset image - call on click Save
                $scope.UploadImage = function () {
                    $rootScope.Showpreloader = true;
                    baseService.UploadImage($scope.AssetID, $scope.FileName, $scope.formdata)
                        .then(function success(response) {
                            $rootScope.Showpreloader = false;
                            $('#uploadImage').modal('hide');
                            $scope.UpdateUserPictureLog();
                            if (response.data[0].status == "failure")
                                $rootScope.AlertMessageBox(response.data[0].message, 'Failure', 'failure');
                            else
                                $rootScope.SearchData($scope.SearchText);
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            $('#uploadImage').modal('hide');
                            $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                        });
                }

                //to zoom asset image
                $scope.ImageModalPopup = function (base64Data, assetID) {
                    $scope.ImageModalAssetID = assetID;
                    $scope.ImageModalBase64Data = base64Data;
                    $('#modalImage').modal('toggle');
                };

                //delete asset image
                $scope.DeleteAssetImage = function (assetid, imgname, triggerID) {
                    $scope.triggerId = triggerID;
                    var dlg = null;
                    dlg = dialogs.confirm('Delete Asset Image', 'Are you sure you want to delete asset image? If you do that, then it can’t be recovered again?');
                    dlg.result.then(function (btn) {
                        $scope.DeleteData('manageassets', 'deletepicture', { 'assetid': assetid, 'filename': imgname })
                            .then(function success(deleteresponse) {
                                $rootScope.UserAlert("Image deleted", "success");
                                $scope.UpdateUserPictureLog();
                                $rootScope.SearchData($scope.SearchText);
                            }, function errorCallback(response) {
                                $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                            });
                    }, function (btn) {

                    });

                };

                //Delete relation
                $scope.DeleteRelation = function (relation, relationList, index) {
                    //$scope.triggerId = triggerID;
                    var dlg = null;
                    dlg = dialogs.confirm('Remove Reference', 'Are you sure you want to remove this referece');
                    dlg.result.then(function (btn) {
                        $scope.SaveData('manageassets', 'deleterelation', null, relation, true)
                            .then(function success(deleteresponse) {
                                $rootScope.UserAlert("Reference removed", "success");
                                relationList.$$state.value.splice(index, 1);
                            }, function errorCallback(response) {
                                $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                            });
                    }, function (btn) {

                    });
                };

                //load edit asset/translation header/fields modal popup
                $scope.loadEditModalPopup = function (keyfield, value, assetId, fieldId, lang, PlainText, langshort, righttoleft, id, sourcevalue, edittype, triggerID, IsHeaderOrBody, defaultlanguagertl) {
                    $scope.IsHeaderOrBody = IsHeaderOrBody;
                    $scope.triggerId = triggerID;
                    $scope.keyfield = keyfield;
                    $scope.OriginalText = value;
                    $scope.SourceValue = sourcevalue;
                    $scope.EditText = value;
                    $scope.assetId = assetId;
                    $scope.fieldId = fieldId;
                    $scope.lang = lang;
                    $scope.langshort = langshort;
                    $scope.id = id;
                    $scope.rtl = righttoleft == true || righttoleft == "true";
                    $scope.defaultlanguagertl = defaultlanguagertl == true || defaultlanguagertl == "true";

                    CKEDITOR.config.contentsLangDirection = $scope.rtl ? "rtl" : "ltr";

                    var foundassetItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset, { id: $scope.id }, true)[0];
                    var assetindex = $scope.lstsearchresult.Hits[0].asset.indexOf(foundassetItem);

                    var editmodal = $('#editmodal');

                    if (edittype == "AssetEdit") {
                        editmodal.modal('show');

                        $scope.ShowSourceValue = false;

                        var foundassetfieldItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset[assetindex].assetfields, { id: $scope.fieldId }, true)[0];
                        var assetfieldindex = $scope.lstsearchresult.Hits[0].asset[assetindex].assetfields.indexOf(foundassetfieldItem);

                        $scope.EditPopupTranslationfielsObject = $scope.lstsearchresult.Hits[0].asset[assetindex].assetfields[assetfieldindex];
                        if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'numeric') {
                            $scope.AssetControlvalue = { value: parseFloat(value) };
                        }
                        else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'dropdown') {
                            var selectedvalue = $.grep($scope.EditPopupTranslationfielsObject.formatting[0].dropdownvalues, function (b) {
                                return b.dropdown_label === value;
                            });
                            $scope.AssetControlvalue = { value: selectedvalue[0] };
                        }
                        else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'listbox') {
                            var picklistdata = [];
                            for (var x = 0; x < value.split(',').length; x++) {
                                var selectedvalue = $.grep($scope.EditPopupTranslationfielsObject.formatting[0].dropdownvalues, function (b) {
                                    return b.dropdown_label === value.split(',')[x];
                                });
                                if (selectedvalue.length != 0) {
                                    picklistdata.push(selectedvalue[0]);
                                }
                            }
                            $scope.AssetControlvalue = { value: picklistdata };
                            $('#editpicklist').selectpicker('val', $scope.AssetControlvalue.value);
                            $rootScope.RefreshSelectPickerOptions();
                        }
                        else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'auto-propagated') {
                            var autoobj = $scope.EditPopupTranslationfielsObject.formatting[0];
                            $scope.SaveData('Manageassets', 'listautopropagatedasset', { 'assetid': assetId, 'fieldname': $scope.EditPopupTranslationfielsObject.tmkeyfield })
                                .then(function success(response) {
                                    if (response.data != "") {
                                        autoobj['autovalues'] = JSON.parse(response.data).autopropagated;
                                    }
                                    else {
                                        autoobj['autovalues'] = [];
                                    }
                                    var selectedautovalue = $.grep($scope.EditPopupTranslationfielsObject.formatting[0].autovalues, function (b) {
                                        return b.Value === value;
                                    });
                                    $scope.AssetControlvalue = { value: selectedautovalue[0] };
                                }, function errorCallback(response) {
                                    autoobj['autovalues'] = [];
                                });
                        }
                        else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'date') {
                            if ($scope.EditPopupTranslationfielsObject.formatting[0].datetime_showdatepicker == true && $scope.EditPopupTranslationfielsObject.formatting[0].datetime_showtimepicker != true) {
                                $scope.AssetControlvalue = { value: parseInt(value) };
                            } else if ($scope.EditPopupTranslationfielsObject.formatting[0].datetime_showdatepicker != true && $scope.EditPopupTranslationfielsObject.formatting[0].datetime_showtimepicker == true) {
                                $scope.AssetControlvalue = { value: parseInt(value) };
                            } else {
                                $scope.AssetControlvalue = value != "" ? { value: new Date(parseInt(value)) } : { value: value };
                            }
                        }
                        else {
                            $scope.AssetControlvalue = { value: value };
                        }

                    } else {
                        $scope.ShowSourceValue = true;

                        var foundtransItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset[assetindex].translations, { langshort: $scope.lang }, true)[0];
                        var transindex = $scope.lstsearchresult.Hits[0].asset[assetindex].translations.indexOf(foundtransItem);

                        var foundfieldItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields, { id: $scope.fieldId }, true)[0];
                        var fieldindex = $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields.indexOf(foundfieldItem);

                        if (foundfieldItem.hascomment == 'false') {
                            editmodal.modal('show');

                            $scope.EditPopupTranslationfielsObject = $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields[fieldindex];

                            if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'numeric') {
                                $scope.Controlvalue = { value: parseFloat(value) };
                            }
                            else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'dropdown') {
                                var selectedvalue = $.grep($scope.EditPopupTranslationfielsObject.formatting[0].dropdownvalues, function (b) {
                                    return b.dropdown_label === value;
                                });
                                $scope.Controlvalue = { value: selectedvalue[0] };
                            }
                            else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'listbox') {
                                var picklistdata = [];
                                for (var x = 0; x < value.split(',').length; x++) {
                                    var selectedvalue = $.grep($scope.EditPopupTranslationfielsObject.formatting[0].dropdownvalues, function (b) {
                                        return b.dropdown_label === value.split(',')[x];
                                    });
                                    if (selectedvalue.length != 0) {
                                        picklistdata.push(selectedvalue[0]);
                                    }
                                }
                                $scope.Controlvalue = { value: picklistdata };
                                $rootScope.RefreshSelectPickerOptions();
                                $('#editpicklist').selectpicker('val', value.split(','));
                            }
                            else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == 'date') {
                                if ($scope.EditPopupTranslationfielsObject.formatting[0].datetime_showdatepicker == true && $scope.EditPopupTranslationfielsObject.formatting[0].datetime_showtimepicker != true) {
                                    $scope.Controlvalue = { value: parseInt(value) };
                                } else if ($scope.EditPopupTranslationfielsObject.formatting[0].datetime_showdatepicker != true && $scope.EditPopupTranslationfielsObject.formatting[0].datetime_showtimepicker == true) {
                                    $scope.Controlvalue = { value: parseInt(value) };
                                } else {
                                    $scope.Controlvalue = { value: new Date(parseInt(value)) };
                                }
                            }
                            else {
                                $scope.Controlvalue = { value: value };
                            }
                        } else {
                            $rootScope.AlertMessageBox("Please resolve any edit requests before editing.", 'Warning', 'warning');
                        }
                    }
                };

                //Load add oneway relation modal
                $scope.loadOnewayRelationModalPopup = function (valueid, popupname, language, relationsList) {
                    $scope.$broadcast('angucomplete-alt:clearInput', 'relation-search');
                    $scope.NewRelationModel = { AssetValueId: valueid };
                    $scope.RelationModalInfo = {
                        Language: language,
                        PopupName: popupname,
                        RelationsList: relationsList
                    };
                }

                //Load add oneway relation modal
                $scope.loadTwowayRelationModalPopup = function (valueid, popupname, language, relationsList) {
                    $scope.$broadcast('angucomplete-alt:clearInput', 'relation-search');
                    $scope.NewRelationModel = { AssetValueId: valueid };
                    $scope.RelationModalInfo = {
                        Language: language,
                        PopupName: popupname,
                        RelationsList: relationsList,
                        ValueFields: []
                    };

                    $rootScope.RefreshSelectPickerOptions();
                }

                //Used for getting search results with rich data e.g. asset id and category
                $scope.LiveAssetSearch = function (userInputString, timeoutPromise) {

                    var urlParameters = {
                        'query': userInputString,
                        'languageCode': $scope.RelationModalInfo.Language,
                        'take': 5
                    };

                    return $scope.GetData('assets', 'assetsearchlive', urlParameters, timeoutPromise)
                        .then(function (response) {
                            var result = {
                                data: {
                                    results: response.data
                                }
                            };

                            //formating categories and sub categories to display bread crumb style in search result
                            for (var i = 0, len = result.data.results.length; i < len; i++) {
                                result.data.results[i].Description = [result.data.results[i].Category, result.data.results[i].Subcategory1, result.data.results[i].Subcategory2, result.data.results[i].Subcategory3].filter(Boolean).join(" / ");
                            }

                            return result;
                        });
                }

                $scope.assetSelectionMade = function (input) {
                    if (input !== undefined) {
                        $scope.NewRelationModel.RelatedAssetId = input.originalObject.AssetId;
                    }
                }

                $scope.assetSelectionMadeGetValueFields = function (input) {
                    if (input !== undefined) {
                        $scope.GetData('assets', 'gettwowayrelationvaluefields', { 'assetId': input.originalObject.AssetId }).then(function success(response) {
                            if (response.data !== undefined && response.data !== null && response.data.length > 0) {
                                $scope.RelationModalInfo.ValueFields = response.data;
                                $rootScope.RefreshSelectPickerOptions();
                            } else {
                                $scope.RelationModalInfo.ValueFields = [];
                                $rootScope.RefreshSelectPickerOptions();
                                $rootScope.AlertMessageBox("The asset does not contain any two way reference fields. Please contact your administrator to add a appropriate field to the template.", 'Warning', 'warning');
                            }
                        }, function failure(response) {

                        });
                    }
                }

                //Add a new relation to relation field
                $scope.addNewRelation = function () {
                    $rootScope.Showpreloader = true;
                    $scope.SaveData('manageAssets', 'createonewayrelation', $scope.NewRelationModel)
                        .then(function success(response) {
                            $rootScope.Showpreloader = false;
                            $('#onewayrelationmodal').modal('hide');
                            $rootScope.UserAlert("Reference added", "success");
                            $scope.RelationModalInfo.RelationsList.$$state.value.push(response.data);
                            $scope.$broadcast('angucomplete-alt:clearInput', 'relation-search');
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            if (response.data.ExceptionMessage != undefined)
                                var message = response.data.ExceptionMessage;
                            else
                                var message = response.message;
                            $rootScope.AlertMessageBox(message, 'Failure', 'failure');
                            $('#onewayrelationmodal').modal('hide');
                            $scope.$broadcast('angucomplete-alt:clearInput', 'relation-search');
                        });
                }

                //Add a new relation to relation field
                $scope.addNewTwoWayRelation = function () {
                    $rootScope.Showpreloader = true;
                    var model = { AssetValueID: $scope.NewRelationModel.AssetValueId, RelatedAssetValueId: $scope.NewRelationModel.RelatedAssetValueId.Id }
                    $scope.SaveData('manageAssets', 'createtwowayrelation', model)
                        .then(function success(response) {
                            $rootScope.Showpreloader = false;
                            $('#onewayrelationmodal').modal('hide');
                            $rootScope.UserAlert("Reference added", "success");
                            $scope.RelationModalInfo.RelationsList.$$state.value.push(response.data);
                            $scope.$broadcast('angucomplete-alt:clearInput', 'relation-search');
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            if (response.data.ExceptionMessage != undefined)
                                var message = response.data.ExceptionMessage;
                            else
                                var message = response.message;
                            $rootScope.AlertMessageBox(message, 'Failure', 'failure');
                            $('#onewayrelationmodal').modal('hide');
                            $scope.$broadcast('angucomplete-alt:clearInput', 'relation-search');
                        });
                }

                //save edit text
                $scope.SaveEditText = function (edittext, isasset) {
                    $rootScope.Showpreloader = true;
                    var EditValue = '';
                    if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == "dropdown") {
                        EditValue = edittext.dropdown_label;
                    }
                    else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == "auto-propagated" && isasset) {
                        EditValue = edittext.Value.split('+').join('%2B');
                    }
                    else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == "listbox") {
                        EditValue = $rootScope.ConvertArrayToString(edittext, 'dropdown_key', ',');
                    }
                    else if ($filter('lowercase')($scope.EditPopupTranslationfielsObject.fieldtype) == "date") {
                        if ($scope.EditPopupTranslationfielsObject.formatting != undefined) {
                            if ($scope.EditPopupTranslationfielsObject.formatting[0].datetime_showdatepicker == true && $scope.EditPopupTranslationfielsObject.formatting[0].datetime_showtimepicker != true) {
                                EditValue = edittext.getTime();
                            } else if ($scope.EditPopupTranslationfielsObject.formatting[0].datetime_showdatepicker != true && $scope.EditPopupTranslationfielsObject.formatting[0].datetime_showtimepicker == true) {
                                EditValue = $filter('date')(edittext, "hh:mm a");
                            } else if ($scope.EditPopupTranslationfielsObject.formatting[0].datetime_showdatepicker == true && $scope.EditPopupTranslationfielsObject.formatting[0].datetime_showtimepicker == true) {
                                EditValue = new Date(edittext).getTime();
                            }
                        }
                    }
                    else {
                        EditValue = edittext;
                    }

                    var hasForceUpdate = $rootScope.HasPermissionForLanguage('force_update', $scope.lang);

                    if (hasForceUpdate) {
                        $scope.SaveData('manageAssets', 'forceupdateasset', { 'assetid': $scope.assetId, 'fieldid': $scope.fieldId }, JSON.stringify(EditValue), true)
                            .then(function success(response) {
                                $rootScope.Showpreloader = false;

                                var foundassetItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset, { assetid: $scope.assetId }, true)[0];
                                var translation = $filter('filter')(foundassetItem.translations, { langshort: response.data.Language }, true)[0];
                                var field = {};

                                if ($scope.IsHeaderOrBody == "Body" | "Header") {
                                    field = $filter('filter')(translation.translationfields, { id: $scope.fieldId }, true)[0];
                                } else {
                                    field = $filter('filter')(foundassetItem.assetfields, { id: $scope.fieldId }, true)[0];
                                }

                                var isSoruceLanguage = $scope.lstsearchresult.Hits[0].defaultlanguage == response.data.Language;

                                field.value = response.data.NewValue;

                                //call to update last action
                                $scope.UpdateLastAction($scope.assetId, $scope.lang);
                                if ($scope.IsHeaderOrBody == "Header") {
                                    if ($scope.triggerId != "") {
                                        $scope.triggerClick($scope.triggerId);
                                    }
                                }

                                $('#editmodal').modal('hide');
                                $rootScope.UserAlert("Translation updated", "success");

                                //Ask for unapproval
                                if (($scope.IsHeaderOrBody == 'Body' && translation.bodyapprovedby != "") || ($scope.IsHeaderOrBody == 'Header' && translation.headerapprovedby != "")) {
                                    var message = isSoruceLanguage ? "This is the source language for the asset, and you can unapprove the source language without unapproving the other languages." : "Do you want to unapprove the chosen language?"

                                    $scope.unapprovalModel = {
                                        type: $scope.IsHeaderOrBody == 'Body' ? "body" : "header",
                                        language: response.data.Language,
                                        isSoruceLanguage: isSoruceLanguage,
                                        asset: foundassetItem,
                                        translation: translation,
                                        message: message

                                    };

                                    $('#unapprovalmodal').modal('show');
                                }

                            }, function errorCallback(response) {
                                $rootScope.Showpreloader = false;
                                if (response.data != undefined)
                                    var message = response.data;
                                else
                                    var message = "failed";
                                $rootScope.AlertMessageBox(message, 'Failure', 'failure');
                                $('#editmodal').modal('hide');
                            });
                    } else {
                        $scope.SaveData('manageAssets', 'updateassetbyid', { 'assetid': $scope.assetId, 'fieldid': $scope.fieldId, 'language': $scope.lang }, JSON.stringify(EditValue), true)
                            .then(function success(response) {
                                $rootScope.Showpreloader = false;
                                $rootScope.SearchData($scope.SearchText);

                                //call to update last action
                                $scope.UpdateLastAction($scope.assetId, $scope.lang);
                                if ($scope.IsHeaderOrBody == "Header") {
                                    if ($scope.triggerId != "") {
                                        $scope.triggerClick($scope.triggerId);
                                    }
                                }
                                $('#editmodal').modal('hide');
                            }, function errorCallback(response) {
                                $rootScope.Showpreloader = false;
                                var message = response.data;
                                $rootScope.AlertMessageBox(message, 'Failure', 'failure');
                                $('#editmodal').modal('hide');
                            });
                    }
                }

                //load modal popup for add comment / accept or reject comment
                $scope.loadApproveTextModalPopup = function (keyfield, assetId, fieldId, lang, righttoleft, hascomment, commentusername, commentdate, comment, value, sourcevalue, istitle, triggerID, IsHeaderOrBody, defaultlanguagertl) {
                    $scope.IsHeaderOrBody = IsHeaderOrBody;
                    $scope.triggerId = triggerID;
                    $scope.OriginalText = value;
                    $scope.SourceValue = sourcevalue;
                    $scope.keyfield = keyfield;
                    $scope.assetId = assetId;
                    $scope.fieldId = fieldId;
                    $scope.lang = lang;
                    $scope.righttoleft = righttoleft == true || righttoleft == "true";;
                    $scope.hasComment = hascomment == "true" ? true : false;
                    $scope.commentusername = commentusername;
                    $scope.commentdate = commentdate;
                    $scope.ApproveText = value;
                    $scope.ApprovalComment = comment;
                    $scope.IsTitle = istitle;
                    $scope.defaultlanguagertl = defaultlanguagertl == "true" || defaultlanguagertl == true; 

                    var diffHtml = dmp.createSemanticDiffHtml(value, comment);
                    var txt = document.createElement('textarea');
                    txt.innerHTML = diffHtml;
                    $scope.diff = txt.value;   

                    var instance = CKEDITOR.instances.apprpveeditor;
                    instance.config.contentsLangDirection = $scope.righttoleft ? "rtl" : "ltr"
                    instance.updateElement();
                }

                //Save edit request/ save comment
                $scope.SaveApproveText = function (approvetext) {
                    $rootScope.Showpreloader = true;
                    $scope.SaveData('manageAssets', 'commentforapproval', { 'assetid': $scope.assetId, 'fieldid': $scope.fieldId, 'language': $scope.lang }, JSON.stringify(approvetext), true)
                        .then(function success(response) {
                            $rootScope.Showpreloader = false;
                            if (response.data != "") {
                                var SaveCommentResponse = response.data;

                                //set saved edit text without search
                                var foundassetItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset, { assetid: $scope.assetId }, true)[0];
                                var assetindex = $scope.lstsearchresult.Hits[0].asset.indexOf(foundassetItem);

                                var foundtransItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset[assetindex].translations, { langshort: $scope.lang }, true)[0];
                                var transindex = $scope.lstsearchresult.Hits[0].asset[assetindex].translations.indexOf(foundtransItem);

                                var foundfieldItem = $filter('filter')($scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields, { id: $scope.fieldId }, true)[0];
                                var fieldindex = $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields.indexOf(foundfieldItem);

                                $scope.ApprovalComment = SaveCommentResponse.value;
                                $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields[fieldindex].hascomment = 'true';

                                if ($scope.IsTitle) {
                                    $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].ProductName.HasComment = 'true';
                                    $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].ProductName.CommentUsername = $rootScope.username;
                                    $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].ProductName.CommentDate = new Date();
                                    $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].ProductName.Comment = SaveCommentResponse.value;
                                } else {
                                    $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields[fieldindex].commentusername = $rootScope.username;
                                    $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields[fieldindex].commentdate = new Date();
                                    $scope.lstsearchresult.Hits[0].asset[assetindex].translations[transindex].translationfields[fieldindex].comment = SaveCommentResponse.value;
                                }
                            }
                            $('#addapprovetext').modal('hide');

                            //call to update last action
                            $scope.UpdateLastAction($scope.assetId, $scope.lang);

                            if ($scope.IsHeaderOrBody == "Header") {
                                if ($scope.triggerId != "") {
                                    $scope.triggerClick($scope.triggerId);
                                }
                            }

                        }, function errorCallback(response) {
                            $('#addapprovetext').modal('hide');
                            $rootScope.Showpreloader = false;
                            $rootScope.AlertMessageBox(response.data.ExceptionMessage, 'Failure', 'failure');
                        })
                }

                $scope.UnapproveLanguage = function (unapproveAll, type) {
                    //$scope.SaveData('manageAssets', 'unapproveasset', { 'assetid': $scope.assetId, 'approvaltype': type, 'language': $scope.lang, 'Unapproveall': unapproveAll }, $scope.ApprovalComment, true)
                    if (unapproveAll == 'all' || unapproveAll == 'targets') {
                        $scope.lang = unapproveAll;
                    }
                    $scope.SaveData('manageAssets', 'unapproveasset', { 'assetid': $scope.assetId, 'approvaltype': type, 'languages': $scope.lang }, $scope.ApprovalComment, true)
                        .then(function success(response) {
                            $rootScope.Showpreloader = false;
                            //call to update last action
                            $scope.UpdateLastAction($scope.assetId, $scope.lang);
                            $rootScope.SearchData($scope.SearchText);
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            if (response.data != undefined) {
                                $rootScope.AlertMessageBox(response.data.ExceptionMessage, 'Failure', 'failure');
                            } else {
                                $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                            }
                        });
                }

                $scope.UnapproveThisAssetAndLanguage = function (asset, translation, language, all, type) {
                    assetService.UnapproveAsset($rootScope.access_token, $scope.assetId, type, language)
                        .then(function success(response) {
                            $rootScope.UserAlert("Unapproved Successfully", "success");

                            //Unapprove all languages
                            if (all) {
                                asset.translations.forEach(function (trans, transIndex) {
                                    if (type == "header")
                                        trans.headerapprovedby = "";
                                    else
                                        trans.bodyapprovedby = "";
                                });
                            } else {
                                if (type == "header")
                                    translation.headerapprovedby = "";
                                else
                                    translation.bodyapprovedby = "";
                            }

                        }, function errorCallback(response) {
                            $rootScope.AlertMessageBox(response.statusText + ": " + response.data, 'Warning', 'warning');
                        });
                }

                //accept or reject comment text
                $scope.AcceptOrRejectApproveText = function (status) {
                    $rootScope.Showpreloader = true;
                    $scope.SaveData('manageAssets', 'approvecomment', { 'assetid': $scope.assetId, 'fieldid': $scope.fieldId, 'language': $scope.lang, 'status': status }, $scope.ApprovalComment, true)
                        .then(function success(response) {
                            $rootScope.Showpreloader = false;
                            if (status == 'approved') {
                                var type = $scope.IsHeaderOrBody == 'Body' ? "body" : "header";
                                if ($scope.lstsearchresult.Hits[0].defaultlanguage == $scope.lang) {
                                    var dlg = dialogs.confirm('', 'Change status on target languages to UNAPPROVED?');
                                    dlg.result.then(function (btn) {
                                        //$scope.UnapproveLanguage(true, type);
                                        $scope.UnapproveLanguage('targets', type);
                                    }, function (btn) {
                                        $rootScope.SearchData($scope.SearchText);
                                        //$scope.UnapproveLanguage(false, type);
                                    });
                                } else {
                                    $rootScope.SearchData($scope.SearchText);
                                }
                            } else {
                                $rootScope.SearchData($scope.SearchText);
                            }

                            //call to update last action
                            $scope.UpdateLastAction($scope.assetId, $scope.lang);
                            $('#addapprovetext').modal('hide');
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            $('#addapprovetext').modal('hide');
                            if (response.data != undefined) {
                                var message = response.data;
                            } else {
                                var message = "Failed to approve or reject edit request";
                            }
                            $rootScope.AlertMessageBox(message, 'Failure', 'failure');
                        })
                }

                //delete asset
                $scope.DeleteAsset = function (assetid) {
                    var dlg = null;
                    dlg = dialogs.confirm('Delete Asset', 'Are you sure you want to permanently delete the asset?');
                    dlg.result.then(function (btn) {
                        $rootScope.Showpreloader = true;
                        $scope.DeleteData('manageAssets', 'deleteasset', { 'assetid': assetid })
                            .then(function success(deleteresponse) {
                                $rootScope.Showpreloader = false;
                                    //call for get user live search list
                                $rootScope.SearchData($scope.SearchText);
                            }, function errorCallback(response) {
                                $rootScope.Showpreloader = false;
                                $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                            });
                    }, function (btn) { console.log("cancelled"); });
                }

                $scope.showhide = function (e) {
                    e.preventDefault();
                    $(this).closest(".data-block-outer").find("> .row").stop(true, true).slideToggle();
                };

                //create asset language
                $scope.CreateAssetLanguage = function (assetid, lang, id) {
                    $scope.SaveData('manageAssets', 'createassetlanguage', { 'assetid': assetid, 'language': lang }, null, false)
                        .then(function success(response) {
                            $scope.triggerId = id;
                            //call to update last action
                            $scope.UpdateLastAction(assetid, lang);
                            $rootScope.SearchData($scope.SearchText);

                        }, function errorCallback(response) {
                            $rootScope.SearchData($scope.SearchText);
                            $rootScope.AlertMessageBox(response.data.ExceptionMessage, 'Failure', 'failure');
                        });
                }

                $scope.GetAllLogHistoryDetail = function (assetid, productnumber, langsort, langlong, righttoleft, assetname) {
                    $scope.LoginHistory = [];
                    $scope.logAssetId = productnumber;
                    $scope.logAssetName = htmlToPlaintext(assetname);
                    $scope.logLang = langlong;
                    $scope.righttoleft = righttoleft;

                    $scope.GetData('assets', 'loghistorydetailed', { 'assetid': assetid, 'language': langsort })
                        .then(function success(response) {
                            if (response.data != "") {
                                if (JSON.parse(response.data).status == undefined) {
                                    $scope.LoginHistory = JSON.parse(response.data);
                                    if ($scope.LoginHistory.loghistory.length != undefined) {
                                        for (var i = 0; i < $scope.LoginHistory.loghistory.length; i++) {
                                            var obj = $scope.LoginHistory.loghistory[i];
                                            var IsDetailOpen = false;
                                            obj['IsDetailOpen'] = IsDetailOpen;

                                            var diffHtml = dmp.createSemanticDiffHtml(obj.oldvalue, obj.newvalue);
                                            var txt = document.createElement('textarea');
                                            txt.innerHTML = diffHtml;
                                            obj.diff =  txt.value;                                            
                                        }
                                    }
                                }
                                $('#loghistorymodal').modal('toggle');
                            }
                            else {
                                $scope.LoginHistory = response.data;
                            }
                        }, function errorCallback(response) {
                            if (response.data != "") {
                                $scope.LoginHistory = JSON.parse(response.data);
                            }
                            else {
                                $scope.LoginHistory = response.data;
                            }
                        });
                }

                $scope.DeleteMultiAsset = function () {

                    var dlg = null;
                    dlg = dialogs.confirm('Delete Asset', 'Are you sure you want to permanently delete the selected assets?');

                    dlg.result.then(function (btn) {

                        $rootScope.Showpreloader = true;

                        assetService.DeleteMultiAssets($rootScope.access_token, $scope.checkedAssetIds.toString())
                            .then(function success(response) {

                                //remove the elements from the UI
                                $scope.checkedAssetIds.forEach(function (id) {
                                    document.getElementsByClassName("accord-row-container " + id)[0].remove();
                                });

                                $rootScope.Showpreloader = false;
                                //reset the selected element-ids                                                       
                                $scope.checkedAssetIds = [];

                            }, function errorCallback(response) {
                                $rootScope.Showpreloader = false;
                                $rootScope.AlertMessageBox(response, 'Warning', 'warning');
                            });
                    }, function (btn) { console.log("delete cancelled"); });
                };


                //ng-models for the approval-modal: Modal.Approve-Multi-Asset.html
                $scope.SelectedApproveMultiAssetLangs = "";
                $scope.SelectedApproveMultiAssetHeader = false;
                $scope.SelectedApproveMultiAssetDescription = false;

                $scope.ApproveMultiAsset = function (langs, head, desc) {

                    var assetIds = $scope.checkedAssetIds;
                    //var lang = $rootScope.ApproveLanguage;

                    assetService.ApproveMultiAsset($rootScope.access_token, assetIds, langs, head, desc)
                        .then(function success(response) {

                            $rootScope.UserAlert("Approved Successfully", "success");

                            //Update the front end
                            $scope.lstsearchresult.Hits[0].asset.forEach(function (asset, assetIndex) {
                                //find the correct asset in the search-result json
                                if (assetIds.indexOf(asset.assetid.toString()) != -1) {
                                    //find the correct the language version
                                    asset.translations.forEach(function (trans, transIndex) {
                                        langs.forEach(function (lang) {
                                            if (trans.langshort == lang.shortname) {
                                                if (head){
                                                    //$scope.lstsearchresult.Hits[0].asset[assetIndex].translations[transIndex].headerapprovedby = "foo";
                                                    $rootScope.UpdateApprovalButtons(asset.assetid, lang.shortname, true ,"header");
                                                }
                                                if (desc){
                                                    //$scope.lstsearchresult.Hits[0].asset[assetIndex].translations[transIndex].bodyapprovedby = "foo";
                                                    $rootScope.UpdateApprovalButtons(asset.assetid, lang.shortname, true ,"body");
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                        }, function errorCallback(response) {
                            $rootScope.AlertMessageBox(response.statusText + ": " + response.data, 'Warning', 'warning');
                        });
                };

                //Updates the JSON file so the frontend will update automatically as a consequence
                $rootScope.UpdateApprovalButtons = function(assetId, assetLangShort, approve, assetPart){

                    $scope.lstsearchresult.Hits[0].asset.forEach(function(asset, assetIndex) {
                        if(asset.id == assetId){
                            asset.translations.forEach(function(translation, transIndex){
                                if(assetLangShort == translation.langshort || assetLangShort == "allTranslations"){ 
                                    
                                    var currentObject = $scope.lstsearchresult.Hits[0].asset[assetIndex].translations[transIndex];

                                    if(approve){
                                        if(assetPart == "header"){
                                            currentObject.headerapprovedby = localStorage.displayname; 
                                            currentObject.HeaderApprovalTooltip = "Header is approved by " + localStorage.displayname;
                                        }
                                        else{
                                            currentObject.bodyapprovedby = localStorage.displayname;
                                            currentObject.DescriptionApprovalTooltip = "Description is approved by " + localStorage.displayname;
                                        }
                                    }else{
                                        if(assetPart == "header"){
                                            currentObject.headerapprovedby = "";
                                            currentObject.HeaderApprovalTooltip = "Header is not approved";
                                        }                                         
                                        else{
                                            currentObject.bodyapprovedby = "";
                                            currentObject.DescriptionApprovalTooltip = "Description is not approved";
                                        }      
                                    }
                                    $scope.lstsearchresult.Hits[0].asset[assetIndex].translations[transIndex] = currentObject;
                                }
                            });
                        }
                    });
                };

                $scope.ApproveHeader = function (assetid, lang, approveby, approveddate, defaultlang, defaultlangapprove) {

                    var approveDate = $filter('date')(approveddate, "dd-MM-yyyy HH:mm");
                    $rootScope.ApproveAssetId = assetid;
                    $rootScope.ApproveLanguage = lang;
                    $rootScope.ApproveType = "header";

                    //if the source language is approved or this is the default language
                    if (defaultlangapprove == 1 || defaultlang == lang) {
                        //if approving
                        if (approveby == "") {
                            $rootScope.ApproveMessage = "Are you sure you want to approve this name for this language?";

                            var dlg = dialogs.create('/dialogs/approve_template.html', 'AssetController_modal', {}, 'lg', undefined, 'md');
                            dlg.result.then(function () {
                                //$rootScope.SearchData($scope.SearchText);
                                $rootScope.UserAlert("Approved Successfully", "success");
                                $rootScope.UpdateApprovalButtons(assetid, lang, true ,"header");
                            }, function () { });
                        }
                        //if unapproving
                        else {
                            //if unapproving the default language
                            if (defaultlang == lang) {
                                $rootScope.isdefaultlangbutton = true;
                                $rootScope.UnapproveMessage = "Asset is already approved by " + approveby + " on the " + approveDate + " for the language. <br/> <br/> This is the default language for the asset, and you can unapproved the default language without unapproving the other languages, or you can unapproved ALL languages."
                            }
                            else {
                                $rootScope.isdefaultlangbutton = false;
                                $rootScope.UnapproveMessage = "Asset is already approved by " + approveby + " on the " + approveDate + " for the language.";
                            }

                            var dlg = dialogs.create('/dialogs/unapprove_template.html', 'AssetController_modal', {}, 'lg', undefined, 'lg');
                            dlg.result.then(function (data) {
                                //$rootScope.SearchData($scope.SearchText);
                                $rootScope.UserAlert("Unapproved Successfully", "success");
                                $rootScope.UpdateApprovalButtons(assetid, lang, false, "header");
                            }, function () { });
                        }
                    } else {
                        //var msg = " The Approval of this version can be done only after the source version has been approved.";
                        //$rootScope.AlertMessageBox(msg, 'Information', 'info');
                        $rootScope.UserAlert("The Approval of this version can be done only after the source version has been approved", "info");
                    }
                }

                $scope.ApproveDescription = function (assetid, lang, approveby, approveddate, defaultlang, defaultlangapprove) {
                    var approveDate = $filter('date')(approveddate, "dd-MM-yyyy HH:mm");
                    $rootScope.ApproveAssetId = assetid;
                    $rootScope.ApproveLanguage = lang;
                    $rootScope.ApproveType = "body";

                    //if the source language is approved or this is the default language
                    if (defaultlangapprove == 1 || defaultlang == lang) {

                        //if approving
                        if (approveby == "") {
                            $rootScope.ApproveMessage = "Are you sure you want to approve the description for this language?";

                            var dlg = dialogs.create('/dialogs/approve_template.html', 'AssetController_modal', {}, 'lg', undefined, 'md');
                            dlg.result.then(function (data) {
                                $rootScope.UserAlert("Approved Successfully", "success");
                                $rootScope.UpdateApprovalButtons(assetid, lang, true, "body");
                                //$rootScope.SearchData($scope.SearchText);
                            }, function () {

                            });
                        }
                        //if unapproving
                        else {
                            if (defaultlang == lang) {
                                $rootScope.isdefaultlangbutton = true;
                                $rootScope.UnapproveMessage = "Asset is already approved by " + approveby + " on the " + approveDate + " for the language. <br/> <br/> This is the default language for the asset, and you can unapproved the default language without unapproving the other languages, or you can unapproved ALL languages."
                            }
                            else {
                                $rootScope.isdefaultlangbutton = false;
                                $rootScope.UnapproveMessage = "Asset is already approved by " + approveby + " on the " + approveDate + " for the language.";
                            }

                            var dlg = dialogs.create('/dialogs/unapprove_template.html', 'AssetController_modal', {}, 'lg', undefined, 'lg');
                            dlg.result.then(function (data) {
                                $rootScope.UserAlert("Unapproved Successfully", "success");
                                $rootScope.UpdateApprovalButtons(assetid, lang, false ,"body");
                                //$rootScope.SearchData($scope.SearchText);
                            }, function () {

                            });
                        }
                    } else {
                        var msg = " The Approval of this version can be done only after the source version has been approved.";
                        $rootScope.AlertMessageBox(msg, 'Information', 'info');
                    }
                }

                $scope.DeleteLanguage = function (assetid, langshort, lang) {
                    var dlg = null;
                    dlg = dialogs.confirm('Delete Language', 'Do you want to delete the language ' + lang + ' for the asset?');
                    dlg.result.then(function (btn) {
                        $scope.DeleteData('manageassets', 'Deleteassetlanguage', { 'assetid': assetid, 'languagename': langshort })
                            .then(function success(deleteresponse) {
                                $rootScope.SearchData($scope.SearchText);
                            });

                    }, function (btn) {
                    });
                }

                //Expand div in to display diffrence in log history popup
                $scope.ExpandItem = function (index, clickableItem, obj) {
                    if ($scope.LoginHistory.loghistory[index] && clickableItem) {
                        $scope.LoginHistory.loghistory[index].IsDetailOpen = !$scope.LoginHistory.loghistory[index].IsDetailOpen;
                    }

                    if ($scope.LoginHistory.loghistory[index].IsDetailOpen) {
                        $scope.GetActionUserPic(obj, obj.actionemail);
                    }
                }
            }
            //Home end            

            //UserDetail
            if ($state.current.name == "UserDetail") {
                $scope.UserDetails = {
                    username: $rootScope.username,
                    fullname: '',
                    shownname: '',
                    picturetype: '',
                    filename: '',
                    Image: null
                };

                $scope.GetUserDetails = function () {
                    $scope.GetData('general', 'getuserinfo', null)
                        .then(function success(response) {
                            if (response.data) {
                                var UserDtlObj = response.data;
                                var image = null;
                                if (UserDtlObj.image != null) {
                                    image = (UserDtlObj.image.indexOf("data:image") !== -1) ? UserDtlObj.image : "data:image/jpeg;base64," + UserDtlObj.image;
                                }
                                $scope.UserDetails = {
                                    username: UserDtlObj.username,
                                    fullname: UserDtlObj.fullname,
                                    shownname: UserDtlObj.shownname,
                                    picturetype: UserDtlObj.imagetype,
                                    filename: UserDtlObj.imagename,
                                    Image: image
                                };
                            }
                            $rootScope.Showpreloader = false;
                        }, function errorCallback(response) {
                            $rootScope.Showpreloader = false;
                            $rootScope.AlertMessageBox(response.data, 'Failure', 'failure');
                        });
                }
                $scope.GetUserDetails();

                $scope.SaveUserDetails = function () {
                    $rootScope.Showpreloader = true;
                    var UserDetailsSaveUrlPera = {
                        username: $scope.UserDetails.username,
                        fullname: $scope.UserDetails.fullname,
                        shownname: $scope.UserDetails.shownname,
                        picturetype: $scope.UserDetails.picturetype,
                        filename: $scope.UserDetails.filename
                    };
                    $scope.SaveData('general', 'changeuserinfo', UserDetailsSaveUrlPera, $scope.UserDetails.Image, true)
                        .then(function success(response) {
                            if (response.data != "") {
                                var data = JSON.parse(response.data);
                                if (data.status == "failure") {
                                    $rootScope.AlertMessageBox(data.failurereason, 'Failure', 'failure');
                                } else {
                                    //$rootScope.AlertMessageBox(data.Status, 'Success', 'success');
                                    $rootScope.UserAlert("Profile info saved", "success")
                                }
                            }
                            $rootScope.UploadProfilePic();
                            $rootScope.Showpreloader = false;
                        }, function errorCallback(response) {
                            $rootScope.AlertMessageBox(data.failurereason, 'Failure', 'failure');
                            $rootScope.Showpreloader = false;
                        });
                };

                //$scope.ProfileImage = "";
                $scope.ProfileImageUpload = function (element) {
                    var defer = $q.defer()
                    var reader = new FileReader();
                    reader.readAsDataURL(element.files[0]);
                    reader.onload = function (e) {
                        var size = ((element.files[0].size) / 1024).toFixed(3);
                        if (size <= 60) {
                            var filename = element.files[0].name;
                            var extension = filename.split('.').pop();
                            $scope.UserDetails.picturetype = extension;
                            $scope.UserDetails.filename = filename;
                            var bytearr = e.target.result;

                            var image = null;
                            if (bytearr.indexOf("data:image") !== -1) {
                                image = bytearr;
                            }
                            else {
                                image = "data:image/jpeg;base64," + bytearr;
                            }

                            $scope.UserDetails.Image = image;
                            defer.resolve(bytearr);
                        }
                        else {
                            $rootScope.AlertMessageBox('Image Size must not be greater than 60KB', 'Warning', 'warning');
                            defer.resolve(true);
                        }

                    }
                    return defer.promise;
                }

            }
            //UserDetail end            

            init();

        }];

    //The approve asset header/description dialog calls this function
    var AssetController_modal = ['$uibModalInstance', '$scope', '$rootScope', 'assetService', 'dialogs', function ($uibModalInstance, $scope, $rootScope, assetService, dialogs) {

        //The approve asset header/description dialog buttons calls this function
        $scope.ApproveAssetData = function () {
            var assetid = $rootScope.ApproveAssetId;
            var lang = $rootScope.ApproveLanguage;
            assetService.ApproveAsset($rootScope.access_token, assetid, $rootScope.ApproveType, lang)
                .then(function success(response) {
                    var lastaction = assetService.LastAction($rootScope.access_token, assetid, lang)
                        .then(function success(response) {
                            $scope.lastactionresponse = JSON.parse(response.data);
                        }, function errorCallback(response) {
                            $scope.lastactionresponse = response.data;
                        });
                    $uibModalInstance.close();
                }, function errorCallback(response) {
                    $uibModalInstance.close();
                    if (response.data != undefined) {
                        dialogs.error("Error", response.data.ExceptionMessage);
                    } else {
                        dialogs.error("Error", response);
                    }

                });
        }

        //The unapprove asset header/description dialog buttons calls this function
        $scope.UnapproveAssetData = function (unapproveAllTranslations) {

            var assetid = $rootScope.ApproveAssetId;
            var lang = $rootScope.ApproveLanguage;

            if (unapproveAllTranslations == true) {
                lang = 'all';
            }

            assetService.UnapproveAsset($rootScope.access_token, assetid, $rootScope.ApproveType, lang)
                .then(function success(response) {
                    var lastaction = assetService.LastAction($rootScope.access_token, assetid, lang)
                        .then(function success(response) {
                            $scope.lastactionresponse = JSON.parse(response.data);
                            
                            if(unapproveAllTranslations)
                                $rootScope.UpdateApprovalButtons(assetid, "allTranslations", false ,$rootScope.ApproveType);
                            else{
                                $rootScope.UpdateApprovalButtons(assetid, lang, false ,$rootScope.ApproveType);
                            }
                            
                        }, function errorCallback(response) {
                            $scope.lastactionresponse = response.data;
                        });
                    $uibModalInstance.close();
                }, function errorCallback(response) {
                    $uibModalInstance.close();
                    if (response.data != undefined) {
                        dialogs.error("Error", response.data.ExceptionMessage);
                    } else {
                        dialogs.error("Error", response);
                    }
                });
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('Canceled');
        }
    }];

    angular
        .module('loginDemo')
        .controller('AssetController', AssetController)
        .controller('AssetController_modal', AssetController_modal)
        .config(['dialogsProvider', '$translateProvider', function (dialogsProvider, $translateProvider) {
            dialogsProvider.useBackdrop('static');
            dialogsProvider.useEscClose(false);
            dialogsProvider.useCopy(false);
            dialogsProvider.setSize('sm');

            $translateProvider.translations('es', {
                DIALOGS_ERROR: "Error",
                DIALOGS_ERROR_MSG: "Se ha producido un error desconocido.",
                DIALOGS_CLOSE: "Cerca",
                DIALOGS_PLEASE_WAIT: "Espere por favor",
                DIALOGS_PLEASE_WAIT_ELIPS: "Espere por favor...",
                DIALOGS_PLEASE_WAIT_MSG: "Esperando en la operacion para completar.",
                DIALOGS_PERCENT_COMPLETE: "% Completado",
                DIALOGS_NOTIFICATION: "Notificacion",
                DIALOGS_NOTIFICATION_MSG: "Notificacion de aplicacion Desconocido.",
                DIALOGS_CONFIRMATION: "Confirmacion",
                DIALOGS_CONFIRMATION_MSG: "Se requiere confirmacion.",
                DIALOGS_OK: "Bueno",
                DIALOGS_YES: "Si",
                DIALOGS_NO: "No"
            });

            $translateProvider.preferredLanguage('en-US');
        }])
        .directive('syncScroll', function () {
            return {
                link: function ($scope, element, attrs) {

                    element.bind('scroll', function () {

                        //calc the scroll percentage of the current element
                        var percentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);

                        //find all the other elements with the same asset-property class
                        var $scrollElms = $('#' + attrs.rowId).find("." + attrs.propClass);

                        //scroll all the elements to same level
                        $scrollElms.each(function () {
                            this.scrollTop = Math.round(percentage * (this.scrollHeight - this.offsetHeight));
                        });
                    });
                }
            };
        })
        .directive('fixedOnScroll', [function () {
            return {
                link: function ($scope, element, attr) {

                    var fixmeTop = $(element).offset().top;

                    $(window).scroll(function () {

                        var currentScroll = $(window).scrollTop() - 50;

                        if (currentScroll >= fixmeTop) {
                            $(element).addClass("pos-fixed");
                        } else {
                            $(element).removeClass("pos-fixed");
                        }
                    });
                }
            }
        }])
        .filter('countRequestComments', function () {
            return function (assetTranslation) {

                var countComments = 0;

                if (assetTranslation.hasOwnProperty('translationfields')) {
                    assetTranslation['translationfields'].forEach(function (currVal) {
                        if (currVal.hasOwnProperty('hascomment') && currVal['hascomment'] == 'true') {
                            ++countComments;
                        }
                    });
                }
                return countComments;
            }
        })
        .filter('hasConfidentialProp', function () {
            return function (assetTranslation) {

                var result = false;

                if (assetTranslation.hasOwnProperty('translationfields')) {
                    assetTranslation['translationfields'].forEach(function (currVal) {

                        //if (currVal.value == 'TEXTMINDEDCONFIDENTIAL') {
                        result = true;
                        return result;
                        //}
                    });
                }

                return result;
            }
        })
        .run(['$templateCache', function ($templateCache) {
            $templateCache.put('/dialogs/approve_template.html', 
            '<div class="modal-header">'+
                '<h4 class="modal-title">Approve</h4>'+
            '</div>'+
            '<div class="modal-body">{{ApproveMessage}}</div>'+
            '<div class="modal-footer">'+
                '<button type="button" class="btn" ng-click="cancel()">Cancel</button>'+
                '<button type="button" class="btn btn-primary" ng-click="ApproveAssetData()">Approve</button>'+
            '</div>');
            
            $templateCache.put('/dialogs/unapprove_template.html', 
                '<div class="modal-header">'+
                    '<h4 class="modal-title">Language is already approved</h4>'+
                '</div>'+
                '<div class="modal-body" ng-bind-html="UnapproveMessage"></div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn" ng-click="cancel()" style="margin-bottom:5px">Cancel</button>'+
                    '<button type="button" class="btn btn-default" ng-show="!isdefaultlangbutton" ng-click="UnapproveAssetData(false)" style="margin-bottom:5px">Unapprove chosen language</button>'+
                    '<button type="button" class="btn btn-default" ng-show="isdefaultlangbutton" ng-click="UnapproveAssetData(false)" style="margin-bottom:5px">Unapprove chosen language</button>'+
                    '<button type="button" class="btn btn-default" ng-show="isdefaultlangbutton" ng-click="UnapproveAssetData(true)" style="margin-bottom:5px">Unapprove all languages</button>'+
                '</div>');
        }]);
})();
