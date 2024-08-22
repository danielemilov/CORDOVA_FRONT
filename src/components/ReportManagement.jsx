import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast
} from "@chakra-ui/react";
import api from '../api';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const toast = useToast();

  const fetchReports = useCallback(async () => {
    try {
      const response = await api.get('/api/reports', {
        params: { status: statusFilter, priority: priorityFilter }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error fetching reports",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [statusFilter, priorityFilter, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await api.patch(`/api/reports/${reportId}`, { status: newStatus });
      fetchReports();
      toast({
        title: "Report status updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error updating report status",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <HStack>
          <Select 
            placeholder="Filter by status" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </Select>
          <Select 
            placeholder="Filter by priority" 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </HStack>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Reporter</Th>
              <Th>Reported User</Th>
              <Th>Reason</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {reports.map((report) => (
              <Tr key={report._id}>
                <Td>{report.reporter.username}</Td>
                <Td>{report.reported.username}</Td>
                <Td>{report.reason}</Td>
                <Td>
                  <Badge colorScheme={report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'yellow' : 'green'}>
                    {report.priority}
                  </Badge>
                </Td>
                <Td>{report.status}</Td>
                <Td>
                  <Select 
                    value={report.status} 
                    onChange={(e) => handleStatusChange(report._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default ReportManagement;