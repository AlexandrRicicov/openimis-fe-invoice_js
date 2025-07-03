import React from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { DoubleArrow, Assessment } from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import {
  LEGAL_AND_FINANCE_MAIN_MENU_CONTRIBUTION_KEY,
  RIGHT_INVOICE_SEARCH,
  RIGHT_BILL_SEARCH,
  RIGHT_BILL_AMEND,
  RIGHT_INVOICE_AMEND,
  DEFAULT,
} from "../constants";
import { withStyles } from "@material-ui/core/styles";

export const DoubleArrowFlipped = withStyles({
  root: {
    transform: "scaleX(-1)",
  },
})(DoubleArrow);

const LegalAndFinanceMainMenu = (props) => {
  const { modulesManager, rights, intl } = props;
  const isWorker = modulesManager.getConf("fe-core", "isWorker", DEFAULT.IS_WORKER);

  const entries = [];

  if (isWorker === true) {
    if (rights.includes(RIGHT_BILL_SEARCH) || rights.includes(RIGHT_BILL_AMEND)) {
      entries.push({
        text: formatMessage(intl, "invoice", "menu.bills"),
        icon: <DoubleArrowFlipped />,
        route: "/bills",
        id: "legalAndFinance.bills",
      });
    }

    // Добавляем наш новый пункт меню "Genereaza factura" для worker-ов тоже
    const hasGenerateRights = rights.includes(RIGHT_BILL_SEARCH) || rights.includes(RIGHT_BILL_AMEND);

    if (hasGenerateRights) {
      entries.push({
        text: formatMessage(intl, "invoice", "menu.generateInvoice"),
        icon: <Assessment />,
        route: "/invoices/generate-report",
        id: "legalAndFinance.generateInvoice",
      });
    }

    if (!entries.length) return null;

    return (
      <MainMenuContribution
        {...props}
        header={formatMessage(intl, "invoice", "mainMenu")}
        entries={entries}
        menuId='LegalAndFinanceMainMenu'
      />
    );
  }

  if (rights.includes(RIGHT_INVOICE_SEARCH) || rights.includes(RIGHT_INVOICE_AMEND)) {
    // RIGHT_SEARCH is shared by HF & HQ staff)
    entries.push({
      text: formatMessage(intl, "invoice", "menu.invoices"),
      icon: <DoubleArrow />,
      route: "/invoices",
      id: "legalAndFinance.invoices",
    });
  }

  if (rights.includes(RIGHT_BILL_SEARCH) || rights.includes(RIGHT_BILL_AMEND)) {
    // RIGHT_SEARCH is shared by HF & HQ staff)
    entries.push({
      text: formatMessage(intl, "invoice", "menu.bills"),
      icon: <DoubleArrowFlipped />,
      route: "/bills",
      id: "legalAndFinance.bills",
    });
  }

  // Добавляем наш новый пункт меню "Genereaza factura"
  const hasGenerateRights = rights.includes(RIGHT_BILL_SEARCH) || rights.includes(RIGHT_BILL_AMEND);

  if (hasGenerateRights) {
    entries.push({
      text: formatMessage(intl, "invoice", "menu.generateInvoice"),
      icon: <Assessment />,
      route: "/invoices/generate-report",
      id: "legalAndFinance.generateInvoice",
    });
  }

  // Получаем contributions от других модулей
  const contribs = modulesManager.getContribs(LEGAL_AND_FINANCE_MAIN_MENU_CONTRIBUTION_KEY);
  entries.push(
    ...contribs.filter((c) => !c.filter || c.filter(rights)),
  );

  if (!entries.length) {
    return null;
  }
  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(intl, "invoice", "mainMenu")}
      entries={entries}
      menuId="LegalAndFinanceMainMenu"
    />
  );
};

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(LegalAndFinanceMainMenu)));
