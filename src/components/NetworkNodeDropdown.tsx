import React, { FC, useCallback, useEffect, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import { OptionProps } from 'react-select';
import styled from 'styled-components';

import addIcon from '@assets/images/icn-add.svg';
import editIcon from '@assets/images/icn-edit.svg';
import { Selector, Typography } from '@components/index';
import { NetworkUtils, useNetworks } from '@services/Store';
import { COLORS, SPACING } from '@theme';
import { translateRaw } from '@translations';
import { CustomNodeConfig, NetworkId, NodeOptions } from '@types';

const SContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: ${SPACING.SM};
`;

const SContainerValue = styled(SContainer)`
  padding: ${SPACING.XS};
  > img {
    position: absolute;
    right: ${SPACING.SM};
  }
`;

const SContainerOption = styled(SContainer)`
  display: flex;
  position: relative;
  align-content: center;
  color: ${COLORS.BLUE_BRIGHT};
`;

const EditIcon = styled.img`
  cursor: pointer;
  padding: ${SPACING.XS} ${SPACING.SM};
  &:hover {
    transition: 200ms ease all;
    opacity: 0.7;
  }
`;

const AddIcon = styled.img`
  display: flex;
  align-self: center;
  height: 12px;
  width: 12px;
  margin-right: ${SPACING.XS};
`;

const newNode = 'NEW_NODE';
const autoNodeLabel = translateRaw('AUTO_NODE');

type NetworkNodeOptionProps = OptionProps<CustomNodeConfig> & {
  isEditEnabled: boolean;
};

const NetworkNodeOption: React.FC<NetworkNodeOptionProps> = ({
  data = { value: {} },
  selectOption
}) => {
  const handleSelect = (d: CustomNodeConfig) => selectOption && selectOption(d);

  if (data.label !== newNode) {
    return (
      <SContainerValue onClick={() => handleSelect(data.value)}>
        <Typography value={data.label} />
      </SContainerValue>
    );
  } else {
    return (
      <SContainerOption onClick={() => handleSelect(data.value)}>
        <AddIcon src={addIcon} />
        {translateRaw('CUSTOM_NODE_DROPDOWN_NEW_NODE')}
      </SContainerOption>
    );
  }
};

interface Props {
  networkId: NetworkId;
  onEdit?(node?: CustomNodeConfig): void;
}

const NetworkNodeDropdown: FC<Props> = ({ networkId, onEdit }) => {
  const { networks, getNetworkById, setNetworkSelectedNode } = useNetworks();
  const [network, setNetwork] = useState(() => getNetworkById(networkId));
  const [selectedNode, setSelectedNode] = useState(() => NetworkUtils.getSelectedNode(network));

  useEffect(() => {
    const newNetwork = getNetworkById(networkId);
    setNetwork(newNetwork);
    setSelectedNode(NetworkUtils.getSelectedNode(newNetwork));
  }, [networkId, networks]);

  const onChange = useCallback(
    (node: NodeOptions) => {
      if (!isEmpty(node) && node.service !== newNode) {
        const { name } = node;
        setNetworkSelectedNode(networkId, name);
        setSelectedNode(node);
      } else if (onEdit) {
        onEdit();
      }
    },
    [networkId, setNetworkSelectedNode]
  );

  const { nodes, autoNode: autoNodeName } = network;
  const autoNode = {
    ...NetworkUtils.getAutoNode(network),
    service: autoNodeLabel
  };
  const { service, name: selectedNodeName } = selectedNode;
  const displayNodes = [autoNode, ...nodes, ...(isFunction(onEdit) ? [{ service: newNode }] : [])];

  return (
    <Selector<NodeOptions & any>
      value={{
        label: selectedNodeName === autoNodeName ? autoNodeLabel : service,
        value: selectedNode
      }}
      options={displayNodes.map((n) => ({ label: n.service, value: n, onEdit }))}
      placeholder={'Auto'}
      searchable={true}
      onChange={(option) => onChange(option)}
      optionComponent={NetworkNodeOption}
      valueComponent={({ value }) => (
        <SContainerValue>
          <Typography value={value.label} />
          {isFunction(onEdit) && value.value.isCustom && value.label !== autoNodeLabel && (
            <EditIcon onClick={() => onEdit(value.value)} src={editIcon} />
          )}
        </SContainerValue>
      )}
    />
  );
};

export default NetworkNodeDropdown;
