package com.alibaba.csp.sentinel.dashboard.rule.kie;

import com.alibaba.csp.sentinel.dashboard.client.servicecombkie.KieConfigClient;
import com.alibaba.csp.sentinel.dashboard.client.servicecombkie.response.KieConfigResponse;
import com.alibaba.csp.sentinel.dashboard.datasource.entity.rule.FlowRuleEntity;
import com.alibaba.csp.sentinel.dashboard.discovery.kie.KieServerInfo;
import com.alibaba.csp.sentinel.dashboard.discovery.kie.KieServerManagement;
import com.alibaba.csp.sentinel.dashboard.rule.DynamicRulePublisher;
import com.alibaba.csp.sentinel.log.RecordLog;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component("flowRuleKiePublisher")
public class FlowRuleKiePublisher implements DynamicRulePublisher<List<FlowRuleEntity>> {

    @Autowired
    KieServerManagement kieServerManagement;

    @Autowired
    KieConfigClient kieConfigClient;

    @Override
    public void publish(String id, List<FlowRuleEntity> entities) {
        if(StringUtils.isEmpty(id) || Objects.isNull(entities)){
            throw new NullPointerException();
        }

        Optional<KieServerInfo> kieServerInfo = kieServerManagement.queryKieInfo(id);
        if(!kieServerInfo.isPresent()){
            RecordLog.error(String.format("Cannot find kie server by id: %s.", id));
            throw new IllegalArgumentException();
        }
        String ruleId = entities.get(0).getRuleId();
        String url = kieServerInfo.get().getKieConfigUrl() + "/" + ruleId;

        List<FlowRule> rules = entities.stream().map(FlowRuleEntity::toRule)
                .collect(Collectors.toList());

        Optional<KieConfigResponse> response = kieConfigClient.updateConfig(url, rules);

        if(!response.isPresent()){
            RecordLog.error("Update rules failed");
            throw new RuntimeException();
        }
    }
}
