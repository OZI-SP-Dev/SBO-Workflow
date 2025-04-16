import { DateTime } from "luxon";
import { spWebContext } from "../providers/SPWebContext";
import { getAPIError } from "./InternalErrors";
import { sleep } from "./ProcessesApiDev";
import { UserApiConfig } from "./UserApi";

export interface IMetricsApi {
  /**
   * Submits a new IMetricEvent
   *
   * @param Title The title of the event, e.g. "Buyer Review"
   * @param ProcessId The IProcess the event is associated with
   * @param Reason One of the ReworkReasons if given
   */
  submitEvent(
    Title: string,
    ProcessID: number,
    Reason?: string
  ): Promise<IMetricEvent>;
}

/**
 * The interface that represents how a Note is formed when it is submitted and returned from submission.
 */
interface IMetricEvent {
  Id?: number;
  Title: string;
  ProcessID: number;
  Reason?: string;
  AuthorId?: number;
  Modified?: string;
}

export default class MetricsApi implements IMetricsApi {
  private metricsList = spWebContext.lists.getByTitle("Metrics");
  private userApi = UserApiConfig.getApi();

  submitEvent = async (
    Title: string,
    ProcessID: number,
    Reason?: string
  ): Promise<IMetricEvent> => {
    try {
      const submitEvent: IMetricEvent = {
        Title,
        ProcessID,
        Reason,
      };
      const returnedEvent = (await this.metricsList.items.add(submitEvent))
        .data;
      return returnedEvent;
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying to submit a metrics event for the Process`
      );
    }
  };
}

export class MetricsApiDev implements IMetricsApi {
  userApi = UserApiConfig.getApi();

  maxId = 0;

  submitEvent = async (
    Title: string,
    ProcessID: number,
    Reason?: string
  ): Promise<IMetricEvent> => {
    await sleep();
    let event = {
      Id: ++this.maxId,
      Title,
      ProcessID,
      Reason,
      Author: await this.userApi.getCurrentUser(),
      Modified: DateTime.local().toISO(),
    };
    return event;
  };
}

export class MetricsApiConfig {
  private static metricsApi: IMetricsApi;

  static getApi(): IMetricsApi {
    if (!this.metricsApi) {
      this.metricsApi =
        process.env.NODE_ENV === "development"
          ? new MetricsApiDev()
          : new MetricsApi();
    }
    return this.metricsApi;
  }
}
