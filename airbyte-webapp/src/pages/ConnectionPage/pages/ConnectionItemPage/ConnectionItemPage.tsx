import React, { Suspense } from "react";
import { FormattedMessage } from "react-intl";
import { useResource } from "rest-hooks";

import PageTitle from "components/PageTitle";
import useRouter from "components/hooks/useRouterHook";
import StepsMenu from "components/StepsMenu";
import StatusView from "./components/StatusView";
import SettingsView from "./components/SettingsView";
import ConnectionResource from "core/resources/Connection";
import LoadingPage from "components/LoadingPage";
import MainPageWithScroll from "components/MainPageWithScroll";
import config from "config";
import { AnalyticsService } from "core/analytics/AnalyticsService";
import FrequencyConfig from "data/FrequencyConfig.json";
import Link from "components/Link";
import { Routes } from "../../../routes";
import DestinationDefinitionResource from "core/resources/DestinationDefinition";
import SourceDefinitionResource from "core/resources/SourceDefinition";

type ConnectionItemPageProps = {
  currentStep: "status" | "settings";
};

const ConnectionItemPage: React.FC<ConnectionItemPageProps> = ({
  currentStep,
}) => {
  const { query, push } = useRouter<{ id: string }>();

  const connection = useResource(ConnectionResource.detailShape(), {
    connectionId: query.id,
  });

  const frequency = FrequencyConfig.find(
    (item) =>
      JSON.stringify(item.config) === JSON.stringify(connection.schedule)
  );

  const sourceDefinition = useResource(
    SourceDefinitionResource.detailShape(),
    connection.source
      ? {
          sourceDefinitionId: connection.source.sourceDefinitionId,
        }
      : null
  );

  const destinationDefinition = useResource(
    DestinationDefinitionResource.detailShape(),
    connection.destination
      ? {
          destinationDefinitionId:
            connection.destination.destinationDefinitionId,
        }
      : null
  );

  const steps = [
    {
      id: "status",
      name: <FormattedMessage id={"sources.status"} />,
    },
    {
      id: "settings",
      name: <FormattedMessage id={"sources.settings"} />,
    },
  ];

  const onSelectStep = (id: string) => {
    if (id === "settings") {
      push(
        `${Routes.Connections}/${connection.connectionId}${Routes.Settings}`
      );
    } else {
      push(`${Routes.Connections}/${connection.connectionId}`);
    }
  };

  const onAfterSaveSchema = () => {
    AnalyticsService.track("Source - Action", {
      user_id: config.ui.workspaceId,
      action: "Edit schema",
      connector_source: connection.source?.sourceName,
      connector_source_id: connection.source?.sourceDefinitionId,
      connector_destination: connection.destination?.destinationName,
      connector_destination_definition_id:
        connection.destination?.destinationDefinitionId,
      frequency: frequency?.text,
    });
  };

  const renderStep = () => {
    if (currentStep === "status") {
      return (
        <StatusView
          connection={connection}
          frequencyText={frequency?.text}
          sourceDefinition={sourceDefinition}
          destinationDefinition={destinationDefinition}
        />
      );
    }

    return (
      <SettingsView
        onAfterSaveSchema={onAfterSaveSchema}
        connectionId={connection.connectionId}
        frequencyText={frequency?.text}
        sourceDefinition={sourceDefinition}
        destinationDefinition={destinationDefinition}
      />
    );
  };

  const linkToSource = () => (
    <Link clear to={`${Routes.Source}/${connection.source?.sourceId}`}>
      {connection.source?.name}
    </Link>
  );

  const linkToDestination = () => (
    <Link
      clear
      to={`${Routes.Destination}/${connection.destination?.destinationId}`}
    >
      {connection.destination?.name}
    </Link>
  );

  return (
    <MainPageWithScroll
      title={
        <PageTitle
          withLine
          title={
            <FormattedMessage
              id="connection.fromTo"
              values={{
                source: linkToSource(),
                destination: linkToDestination(),
              }}
            />
          }
          middleComponent={
            <StepsMenu
              lightMode
              data={steps}
              onSelect={onSelectStep}
              activeStep={currentStep}
            />
          }
        />
      }
    >
      <Suspense fallback={<LoadingPage />}>{renderStep()}</Suspense>
    </MainPageWithScroll>
  );
};

export default ConnectionItemPage;
