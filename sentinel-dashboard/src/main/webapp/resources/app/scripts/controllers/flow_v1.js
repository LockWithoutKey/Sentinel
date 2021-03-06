var app = angular.module('sentinelDashboardApp');

app.controller('FlowControllerV1', ['$scope', '$stateParams', 'FlowServiceV1', 'ngDialog', 'KieFlowService', 'FixtureService',
  function ($scope, $stateParams, FlowService, ngDialog, KieFlowService, FixtureService) {
    $scope.service = $stateParams.service;
    $scope.currentId = $stateParams.id
    $scope.rulesPageConfig = {
      pageSize: 10,
      currentPageIndex: 1,
      totalPage: 1,
      totalCount: 0,
    };

    $scope.generateThresholdTypeShow = (rule) => {
      if (!rule.clusterMode) {
        return '单机';
      }
      if (rule.clusterConfig.thresholdType === 0) {
        return '集群均摊';
      } else if (rule.clusterConfig.thresholdType === 1) {
        return '集群总体';
      } else {
        return '集群';
      }
    };

    flowRulesInit = async () => {
      getKieFlowRules();
    }
    flowRulesInit();

    function getKieFlowRules() {
      console.log("$scope.currentId", $scope.currentId);
      KieFlowService.getKieFlowRules($scope.currentId).success(data => {
        // fix
        if (window.fixtureFlag) {
          data = FixtureService.getKieFlowRules($scope.currentId);
        }
        if (data.success && data.data) {
          $scope.rules = data.data;
          $scope.rulesPageConfig.totalCount = $scope.rules.length;
        } else {
          $scope.rules = [];
          $scope.rulesPageConfig.totalCount = 0;
        }
      });
    }
    $scope.getKieFlowRules = getKieFlowRules;

    var flowRuleDialog;
    // TODOS
    $scope.editRule = function (rule, $index) {
      $scope.currentRule = angular.copy(rule);
      $scope.editIndex = $index;
      $scope.flowRuleDialog = {
        title: '编辑流控规则',
        type: 'edit',
        confirmBtnText: '保存',
        showAdvanceButton: rule.controlBehavior == 0 && rule.strategy == 0
      };
      flowRuleDialog = ngDialog.open({
        template: '/app/views/dialog/flow-rule-dialog.html',
        width: 680,
        overlay: true,
        scope: $scope
      });
    };

    $scope.addNewRule = function () {
      var mac = $scope.macInputModel.split(':');
      $scope.currentRule = {
        grade: 1,
        strategy: 0,
        controlBehavior: 0,
        app: $scope.app,
        ip: mac[0],
        port: mac[1],
        limitApp: 'default',
        clusterMode: false,
        clusterConfig: {
          thresholdType: 0
        }
      };
      $scope.flowRuleDialog = {
        title: '新增流控规则',
        type: 'add',
        confirmBtnText: '新增',
        showAdvanceButton: true,
      };
      flowRuleDialog = ngDialog.open({
        template: '/app/views/dialog/flow-rule-dialog.html',
        width: 680,
        overlay: true,
        scope: $scope
      });
    };

    $scope.saveRule = function () {
      if ($scope.flowRuleDialog.type === 'add') {
        addNewRule($scope.currentRule);
      } else if ($scope.flowRuleDialog.type === 'edit') {
        saveRule($scope.currentRule, true);
      }
    };

    var confirmDialog;
    $scope.deleteRule = function (rule) {
      $scope.currentRule = rule;
      $scope.confirmDialog = {
        title: '删除流控规则',
        type: 'delete_rule',
        attentionTitle: '请确认是否删除如下流控规则',
        attention: '资源名: ' + rule.resource + ', 流控应用: ' + rule.limitApp
          + ', 阈值类型: ' + (rule.grade == 0 ? '线程数' : 'QPS') + ', 阈值: ' + rule.count,
        confirmBtnText: '删除',
      };
      confirmDialog = ngDialog.open({
        template: '/app/views/dialog/confirm-dialog.html',
        scope: $scope,
        overlay: true
      });
    };

    $scope.confirm = function () {
      if ($scope.confirmDialog.type === 'delete_rule') {
        deleteRule($scope.currentRule);
      } else {
        console.error('error');
      }
    };

    function deleteRule(rule) {
      FlowService.deleteRule(rule).success(function (data) {
        if (data.code == 0) {
          // getMachineRules();
          confirmDialog.close();
        } else {
          alert('失败：' + data.msg);
        }
      });
    };

    function addNewRule(rule) {
      FlowService.newRule(rule).success(function (data) {
        if (data.code === 0) {
          // getMachineRules();
          flowRuleDialog.close();
        } else {
          alert('失败：' + data.msg);
        }
      });
    };

    $scope.onOpenAdvanceClick = function () {
      $scope.flowRuleDialog.showAdvanceButton = false;
    };
    $scope.onCloseAdvanceClick = function () {
      $scope.flowRuleDialog.showAdvanceButton = true;
    };

    function saveRule(rule, edit) {
      if (edit) {
        $scope.rules[$scope.editIndex] = rule;
        KieFlowService.updateKieFlowRules($scope.currentId, $scope.rules).success(data => {
          if (data.success) {
            flowRuleDialog.close();
            getKieFlowRules();
          } else {
            flowRuleDialog.close();
            alert('失败：' + data.msg);
            getKieFlowRules();
          }
          
        })
      }
    }
  }]);
