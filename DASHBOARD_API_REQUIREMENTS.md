# Dashboard API Documentation

This document outlines the required API endpoints and their expected JSON responses for the Dashboard page functionality.

## API Endpoints Required

### 1. Dashboard Statistics
**Endpoint:** `GET /api/dashboard/statistics`  
**Description:** Returns overall statistics for the dashboard cards  
**Authentication:** Required (Bearer token)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 12,
    "totalProjectsChange": "+2 this month",
    "teamMembers": 8,
    "teamMembersChange": "+1 this week",
    "activeIssues": 23,
    "activeIssuesChange": "5 resolved today",
    "completedTasks": 156,
    "completedTasksChange": "+12 this week"
  }
}
```

### 2. Recent Activity
**Endpoint:** `GET /api/dashboard/recent-activity`  
**Description:** Returns recent activities across all projects  
**Authentication:** Required (Bearer token)  
**Query Parameters:** 
- `limit` (optional): Number of activities to return (default: 10)

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "John completed task 'UI Design'",
      "description": "Task 'UI Design' was marked as completed in Website Redesign project",
      "type": "task_completed",
      "userId": 3,
      "userName": "John Doe",
      "userAvatar": "https://example.com/avatars/john.jpg",
      "projectId": 5,
      "projectName": "Website Redesign",
      "entityId": 15,
      "entityType": "task",
      "createdAt": "2024-01-15T14:30:00Z",
      "timeAgo": "2 hours ago"
    },
    {
      "id": 2,
      "action": "Sarah created new issue in Website Redesign",
      "description": "New issue 'Fix mobile responsiveness' was created",
      "type": "issue_created",
      "userId": 7,
      "userName": "Sarah Smith",
      "userAvatar": "https://example.com/avatars/sarah.jpg",
      "projectId": 5,
      "projectName": "Website Redesign",
      "entityId": 23,
      "entityType": "issue",
      "priority": "high",
      "createdAt": "2024-01-15T10:15:00Z",
      "timeAgo": "4 hours ago"
    },
    {
      "id": 3,
      "action": "Mike joined Mobile App Development team",
      "description": "Mike was added as a team member to the project",
      "type": "member_joined",
      "userId": 12,
      "userName": "Mike Johnson",
      "userAvatar": "https://example.com/avatars/mike.jpg",
      "projectId": 8,
      "projectName": "Mobile App Development",
      "entityId": null,
      "entityType": "team",
      "createdAt": "2024-01-14T09:22:00Z",
      "timeAgo": "1 day ago"
    },
    {
      "id": 4,
      "action": "Lisa updated project deadline",
      "description": "Due date changed from 2024-01-20 to 2024-01-25",
      "type": "project_updated",
      "userId": 5,
      "userName": "Lisa Chen",
      "userAvatar": "https://example.com/avatars/lisa.jpg",
      "projectId": 3,
      "projectName": "Marketing Campaign",
      "entityId": 3,
      "entityType": "project",
      "oldValue": "2024-01-20",
      "newValue": "2024-01-25",
      "createdAt": "2024-01-13T16:45:00Z",
      "timeAgo": "2 days ago"
    },
    {
      "id": 5,
      "action": "Task 'Database Schema' assigned to David",
      "description": "David was assigned to work on database schema design",
      "type": "task_assigned",
      "userId": 9,
      "userName": "Admin User",
      "userAvatar": "https://example.com/avatars/admin.jpg",
      "assigneeId": 11,
      "assigneeName": "David Wilson",
      "projectId": 8,
      "projectName": "Mobile App Development",
      "entityId": 18,
      "entityType": "task",
      "createdAt": "2024-01-13T11:30:00Z",
      "timeAgo": "2 days ago"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "hasNext": true
  }
}
```

### 3. Project Counts by Status
**Endpoint:** `GET /api/dashboard/project-counts`  
**Description:** Returns project counts grouped by status  
**Authentication:** Required (Bearer token)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "byStatus": {
      "planning": 2,
      "in_progress": 6,
      "review": 3,
      "completed": 1
    },
    "byPriority": {
      "low": 3,
      "medium": 5,
      "high": 4
    },
    "recentlyCreated": 2,
    "overdue": 1,
    "dueSoon": 3
  }
}
```

## Activity Types Reference

The `type` field in recent activities can have the following values:

- `task_completed` - A task was marked as completed
- `task_assigned` - A task was assigned to someone
- `task_created` - A new task was created
- `issue_created` - A new issue was reported
- `issue_resolved` - An issue was resolved
- `issue_assigned` - An issue was assigned
- `member_joined` - A new member joined the project
- `member_removed` - A member was removed from the project
- `project_created` - A new project was created
- `project_updated` - Project details were updated
- `comment_added` - A comment was added
- `file_uploaded` - A file was uploaded
- `deadline_changed` - Project deadline was modified

## Implementation Notes

1. **Time Formatting:** The `timeAgo` field should be human-readable (e.g., "2 hours ago", "1 day ago")
2. **User Information:** Include user avatar URLs for better UI experience
3. **Pagination:** Recent activity should support pagination for performance
4. **Real-time Updates:** Consider implementing WebSocket or SSE for real-time activity updates
5. **Filtering:** Future enhancement could include filtering activities by type or project

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "redirectToLogin": true
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to fetch dashboard data"
  }
}
```
