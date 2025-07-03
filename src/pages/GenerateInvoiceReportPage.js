import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { makeStyles } from '@material-ui/styles';
import { Typography, Grid, Paper, Button } from '@material-ui/core';
import { useModulesManager, useTranslations, PublishedComponent, useToast, journalize } from '@openimis/fe-core';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { createMonthBill } from '../actions';
import { ACTION_TYPE } from '../reducer';

const useStyles = makeStyles((theme) => ({
    page: {
        ...theme.page,
        padding: theme.spacing(2),
    },
    paper: {
        ...theme.paper.paper,
        padding: theme.spacing(3),
    },
    title: {
        marginBottom: theme.spacing(2),
    },
    form: {
        marginTop: theme.spacing(2),
    },
    button: {
        marginTop: theme.spacing(3),
    },
}));

const MODULE_NAME = 'invoice';

function GenerateInvoiceReportPage() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const modulesManager = useModulesManager();
    const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
    const rights = useSelector((state) => (state.core?.user?.i_user?.rights ?? []));
    const { economicUnit } = useSelector((state) => state.policyHolder);
    const submittingMutation = useSelector((state) => state.invoice?.submittingMutation);
    const mutation = useSelector((state) => state.invoice?.mutation);
    const { showSuccess, showError } = useToast();

    // Получаем текущий месяц
    const currentMonth = new Date().getMonth() + 1; // getMonth() возвращает 0-11, поэтому +1

    const [filters, setFilters] = useState({
        month: currentMonth,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const prevSubmittingMutationRef = useRef();

    // Handle mutation result with journalize
    useEffect(() => {
        if (prevSubmittingMutationRef.current && !submittingMutation) {
            dispatch(journalize(mutation));
            if (mutation?.actionType === ACTION_TYPE.CREATE_MONTH_BILL) {
                setIsGenerating(false);

                // Show success/error notification based on mutation result
                if (mutation?.error) {
                    showError(formatMessage('invoice.generateInvoiceReport.error'));
                } else {
                    showSuccess(formatMessage('invoice.generateInvoiceReport.success'));
                }
            }
        }
    }, [submittingMutation, mutation, dispatch, showSuccess, showError, formatMessage]);

    // Update previous submitting mutation state
    useEffect(() => {
        prevSubmittingMutationRef.current = submittingMutation;
    });

    const handleGenerateInvoice = () => {
        // Validate required fields
        if (!filters.month) {
            showError(formatMessage('invoice.generateInvoiceReport.monthRequired'));
            return;
        }

        if (!economicUnit?.code) {
            showError(formatMessage('invoice.generateInvoiceReport.economicUnitRequired'));
            return;
        }

        setIsGenerating(true);

        // Execute mutation - result will be handled by useEffect with journalize
        dispatch(createMonthBill(
            filters.month,
            economicUnit.code,
            formatMessage('invoice.generateInvoiceReport.mutationLabel', { month: filters.month })
        ));
    };

    return (
        <div className={classes.page}>
            <Helmet title={formatMessage('invoice.menu.generateInvoice')} />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                                <AssessmentIcon color="primary" />
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" className={classes.title}>
                                    {formatMessage('invoice.menu.generateInvoice')}
                                </Typography>
                            </Grid>
                        </Grid>
                        {economicUnit && (
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                <strong>{formatMessage('invoice.generateInvoiceReport.selectedCompany')}:</strong> {economicUnit.code} - {economicUnit.tradeName}
                            </Typography>
                        )}

                        <div className={classes.form}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <PublishedComponent
                                        pubRef="core.MonthPicker"
                                        module="invoice"
                                        label="month"
                                        value={filters.month}
                                        required
                                        withNull={false}
                                        onChange={(month) => setFilters({ ...filters, month })}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        startIcon={<AssessmentIcon />}
                                        onClick={handleGenerateInvoice}
                                        className={classes.button}
                                        disabled={!filters.month || isGenerating}
                                    >
                                        {isGenerating
                                            ? formatMessage('invoice.generateInvoiceReport.generating')
                                            : formatMessage('invoice.generateInvoiceReport.generate')
                                        }
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default GenerateInvoiceReportPage; 