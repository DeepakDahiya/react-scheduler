import { useEffect, useReducer, ReactChild } from "react";
import { getAvailableViews, getOneView } from "../../helpers/generals";
import { EventActions, ProcessedEvent, SchedulerProps } from "../../Scheduler";
import {
  defaultProps,
  SchedulerState,
  SelectedRange,
  StateContext,
} from "./stateContext";
import { stateReducer } from "./stateReducer";

interface AppProps {
  children: ReactChild;
  initial: SchedulerProps;
}

const initialState = (initial: SchedulerProps): SchedulerState => {
  const initialView = initial[initial.view]
    ? initial.view
    : getOneView(initial);
  return {
    ...initial,
    view: initialView,
    dialog: false,
    selectedRange: undefined,
    fields: [...defaultProps.fields, ...initial.fields],
  };
};

const AppState = ({ initial, children }: AppProps) => {
  const {
    events,
    loading,
    view,
    resourceViewMode,
    fields,
    resources,
    selectedDate,
  } = initial;
  const [state, dispatch] = useReducer(stateReducer, initialState(initial));

  const handleState = (
    value: SchedulerState[keyof SchedulerState],
    name: keyof SchedulerState
  ) => {
    dispatch({ type: "set", payload: { name, value } });
  };

  const updateProps = (initials: SchedulerProps) => {
    dispatch({ type: "updateProps", payload: initials });
  };
  useEffect(() => {
    updateProps({
      events,
      loading,
      view,
      resourceViewMode,
      fields,
      resources,
      selectedDate,
    } as SchedulerProps);
  }, [
    events,
    loading,
    view,
    resourceViewMode,
    fields,
    resources,
    selectedDate,
  ]);

  const confirmEvent = (event: ProcessedEvent, action: EventActions) => {
    let updatedEvents: ProcessedEvent[];
    if (action === "edit") {
      updatedEvents = state.events.map((e) =>
        e.event_id === event.event_id ? event : e
      );
    } else {
      updatedEvents = [...state.events, event];
    }
    handleState(updatedEvents, "events");
  };

  const getViews = () => getAvailableViews(state);

  const triggerDialog = (
    status: boolean | undefined,
    selected: SelectedRange | ProcessedEvent
  ) => {
    dispatch({ type: "triggerDialog", payload: { status, selected } });
  };
  const triggerLoading = (status: boolean | undefined) => {
    dispatch({ type: "triggerLoading", payload: { status } });
  };
  const handleGotoDay = (day: Date) => {
    const views = getViews();
    if (views.includes("day")) {
      handleState("day", "view");
      handleState(day, "selectedDate");
    } else if (views.includes("week")) {
      handleState("week", "view");
      handleState(day, "selectedDate");
    } else {
      console.warn("No Day/Week views available");
    }
  };
  return (
    <StateContext.Provider
      value={{
        ...state,
        handleState,
        getViews,
        triggerDialog,
        triggerLoading,
        handleGotoDay,
        confirmEvent,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export { AppState };