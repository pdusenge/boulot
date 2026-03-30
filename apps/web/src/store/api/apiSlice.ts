import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IProject, IUser, IDispute, ITemplate, IProposal, IApplication, ApplicationStatus } from '@boulot/types';
import { getToken } from '../../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Projects', 'Proposals', 'Templates', 'User', 'Disputes', 'Portfolio'],
  endpoints: (builder) => ({
    getProjects: builder.query<IProject[], void>({
      query: () => '/projects',
      transformResponse: (response: { data: IProject[] }) => response.data,
      providesTags: ['Projects'],
    }),
    getMyProjects: builder.query<IProject[], void>({
      query: () => '/projects/sme/my-projects',
      transformResponse: (response: { data: IProject[] }) => response.data,
      providesTags: ['Projects'],
    }),
    getMyWorkProjects: builder.query<IProject[], void>({
      query: () => '/projects/me',
      transformResponse: (response: { data: IProject[] }) => response.data,
      providesTags: ['Projects'],
    }),
    getProjectById: builder.query<IProject, string>({
      query: (id) => `/projects/${id}`,
      transformResponse: (response: { data: IProject }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Projects', id }],
    }),
    createProject: builder.mutation<IProject, { title: string; description: string; budget: number; skillsRequired: string[]; templateId?: string }>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IProject }) => response.data,
      invalidatesTags: ['Projects'],
    }),
    submitReview: builder.mutation<IProject, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/submit-review`,
        method: 'POST',
      }),
      transformResponse: (response: { data: IProject }) => response.data,
      invalidatesTags: (result, error, id) => [{ type: 'Projects', id }, 'Projects'],
    }),
    approveProject: builder.mutation<IProject, { projectId: string; feedback: string }>({
      query: ({ projectId, feedback }) => ({
        url: `/projects/${projectId}/approve`,
        method: 'POST',
        body: { feedback },
      }),
      transformResponse: (response: { data: IProject }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Projects', id: projectId }, 'Projects'],
    }),
    rejectProject: builder.mutation<IProject, { projectId: string; feedback: string }>({
      query: ({ projectId, feedback }) => ({
        url: `/projects/${projectId}/reject`,
        method: 'POST',
        body: { feedback },
      }),
      transformResponse: (response: { data: IProject }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Projects', id: projectId }, 'Projects'],
    }),
    
    // Auth & Users
    verifyId: builder.mutation<IUser, { nationalId: string; fullName: string }>({
      query: (body) => ({
        url: '/auth/verify-id',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IUser }) => response.data,
      invalidatesTags: ['User'],
    }),
    updateProfile: builder.mutation<
      IUser,
      Partial<Pick<IUser, 'bio' | 'skills' | 'githubUsername' | 'phone'>>
    >({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: { data: IUser }) => response.data,
      invalidatesTags: ['User', 'Portfolio'],
    }),

    // Escrow
    depositEscrow: builder.mutation<any, { projectId: string; amount: number; payerPhone: string }>({
      query: (body) => ({
        url: '/escrow/deposit',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: any }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Projects', id: projectId }, 'Projects'],
    }),
    getEscrowStatus: builder.query<any, string>({
      query: (projectId) => `/escrow/${projectId}`,
      transformResponse: (response: { data: any }) => response.data,
      providesTags: (result, error, projectId) => [{ type: 'Projects', id: projectId }],
    }),

    // Templates
    getTemplates: builder.query<ITemplate[], void>({
      query: () => '/templates',
      transformResponse: (response: { data: ITemplate[] }) => response.data,
      providesTags: ['Templates'],
    }),
    createTemplate: builder.mutation<ITemplate, Partial<ITemplate>>({
      query: (body) => ({
        url: '/templates',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: ITemplate }) => response.data,
      invalidatesTags: ['Templates'],
    }),
    updateTemplate: builder.mutation<ITemplate, { id: string; body: Partial<ITemplate> }>({
      query: ({ id, body }) => ({
        url: `/templates/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: { data: ITemplate }) => response.data,
      invalidatesTags: ['Templates'],
    }),
    deleteTemplate: builder.mutation<ITemplate, { id: string }>({
      query: ({ id }) => ({
        url: `/templates/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { data: ITemplate }) => response.data,
      invalidatesTags: ['Templates'],
    }),

    // Proposals
    submitProposal: builder.mutation<any, { projectId: string; coverLetter: string; proposedPrice: number; estimatedDays: number; referenceLinks?: string[] }>({
      query: (body) => ({
        url: '/proposals',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: any }) => response.data,
      invalidatesTags: ['Proposals'],
    }),
    getProjectProposals: builder.query<IProposal[], string>({
      query: (projectId) => `/proposals/project/${projectId}`,
      transformResponse: (response: { data: IProposal[] }) => response.data,
      providesTags: ['Proposals'],
    }),
    acceptProposal: builder.mutation<IProposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/accept`,
        method: 'POST',
      }),
      transformResponse: (response: { data: IProposal }) => response.data,
      invalidatesTags: ['Proposals', 'Projects'],
    }),
    getMyProposals: builder.query<IProposal[], void>({
      query: () => '/proposals/student/my-proposals',
      transformResponse: (response: { data: IProposal[] }) => response.data,
      providesTags: ['Proposals'],
    }),

    // Applications (structured bidding)
    submitApplication: builder.mutation<
      IApplication,
      { projectId: string; timeline: number; proposalText: string; githubLinks: string[] }
    >({
      query: (body) => ({
        url: '/applications',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: IApplication }) => response.data,
      invalidatesTags: ['Projects'],
    }),
    getStudentApplicationStats: builder.query<
      { todayCount: number; remainingToday: number; dailyLimit: number },
      void
    >({
      query: () => '/applications/student/stats',
      transformResponse: (response: { data: { todayCount: number; remainingToday: number; dailyLimit: number } }) => response.data,
    }),
    getMyApplicationForProject: builder.query<IApplication | null, { projectId: string }>({
      query: ({ projectId }) => `/applications/student/project/${projectId}`,
      transformResponse: (response: { data: IApplication | null }) => response.data,
      providesTags: ['Projects'],
    }),
    getProjectApplications: builder.query<
      { items: Array<any>; page: number; limit: number },
      { projectId: string; page?: number; limit?: number }
    >({
      query: ({ projectId, page = 1, limit = 20 }) => `/projects/${projectId}/applications?page=${page}&limit=${limit}`,
      transformResponse: (response: { data: { items: Array<any>; page: number; limit: number } }) => response.data,
      providesTags: ['Projects'],
    }),
    updateApplicationStatus: builder.mutation<
      IApplication,
      { id: string; status: ApplicationStatus }
    >({
      query: ({ id, status }) => ({
        url: `/applications/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: { data: IApplication }) => response.data,
      invalidatesTags: ['Projects'],
    }),

    // Admin
    adminGetUsers: builder.query<IUser[], { query?: string } | void>({
      query: (args) => {
        const q = (args as any)?.query ? `?query=${encodeURIComponent((args as any).query)}` : '';
        return `/admin/users${q}`;
      },
      transformResponse: (response: { data: IUser[] }) => response.data,
      providesTags: ['User'],
    }),
    adminUpdateUserRole: builder.mutation<IUser, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (response: { data: IUser }) => response.data,
      invalidatesTags: ['User'],
    }),

    // Review queue (Mentor/Admin)
    getReviewQueue: builder.query<IProject[], void>({
      query: () => '/projects/review-queue',
      transformResponse: (response: { data: IProject[] }) => response.data,
      providesTags: ['Projects'],
    }),

    // Admin: all projects with full team info
    getAdminAllProjects: builder.query<IProject[], void>({
      query: () => '/projects/admin/all',
      transformResponse: (response: { data: IProject[] }) => response.data,
      providesTags: ['Projects'],
    }),

    // Mentor: all assigned projects with team info
    getMentorProjects: builder.query<IProject[], void>({
      query: () => '/projects/mentor/my-projects',
      transformResponse: (response: { data: IProject[] }) => response.data,
      providesTags: ['Projects'],
    }),

    // Messages
    sendMessage: builder.mutation<any, { projectId: string; receiverId: string; content: string }>({
      query: (body) => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    getProjectMessages: builder.query<any[], { projectId: string }>({
      query: ({ projectId }) => `/messages/project/${projectId}`,
      transformResponse: (response: { data: any[] }) => response.data,
    }),
    getProjectParticipants: builder.query<Array<{ id: string; fullName: string; role: string }>, { projectId: string }>({
      query: ({ projectId }) => `/messages/project/${projectId}/participants`,
      transformResponse: (response: { data: Array<{ id: string; fullName: string; role: string }> }) => response.data,
    }),
    markMessageRead: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/messages/${id}/read`,
        method: 'PATCH',
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/messages/unread',
      transformResponse: (response: { data: { count: number } }) => response.data,
    }),

    // Disputes
    getOpenDisputes: builder.query<IDispute[], void>({
      query: () => '/disputes/open',
      transformResponse: (response: { data: IDispute[] }) => response.data,
      providesTags: ['Disputes'],
    }),
    resolveDispute: builder.mutation<any, { id: string; resolution: string; action: string }>({
      query: ({ id, ...body }) => ({
        url: `/disputes/${id}/resolve`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: any }) => response.data,
      invalidatesTags: ['Disputes', 'Projects'],
    }),

    // Portfolio
    getPublicPortfolio: builder.query<any, string>({
      query: (studentId) => `/portfolios/public/${studentId}`,
      transformResponse: (response: { data: any }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Portfolio', id }],
    }),

    // Mentor Assignment (Admin)
    assignMentor: builder.mutation<IProject, { projectId: string; mentorId: string }>({
      query: ({ projectId, mentorId }) => ({
        url: `/projects/${projectId}/assign-mentor`,
        method: 'PATCH',
        body: { mentorId },
      }),
      transformResponse: (response: { data: IProject }) => response.data,
      invalidatesTags: ['Projects'],
    }),
    getProjectsWithoutMentor: builder.query<IProject[], void>({
      query: () => '/projects/unassigned',
      transformResponse: (response: { data: IProject[] }) => response.data,
      providesTags: ['Projects'],
    }),

    // Student Search (SME)
    searchStudents: builder.query<any[], { skill?: string; tier?: string; minCompletionRate?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.skill) searchParams.set('skill', params.skill);
        if (params.tier) searchParams.set('tier', params.tier);
        if (params.minCompletionRate !== undefined) searchParams.set('minCompletionRate', String(params.minCompletionRate));
        return `/portfolios/search?${searchParams.toString()}`;
      },
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: ['Portfolio'],
    })
  }),
});

export const {
  useGetProjectsQuery,
  useGetMyProjectsQuery,
  useGetMyWorkProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useSubmitReviewMutation,
  useApproveProjectMutation,
  useRejectProjectMutation,
  useVerifyIdMutation,
  useUpdateProfileMutation,
  useDepositEscrowMutation,
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useSubmitProposalMutation,
  useGetProjectProposalsQuery,
  useAcceptProposalMutation,
  useGetMyProposalsQuery,
  useSubmitApplicationMutation,
  useGetStudentApplicationStatsQuery,
  useGetMyApplicationForProjectQuery,
  useGetProjectApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useAdminGetUsersQuery,
  useAdminUpdateUserRoleMutation,
  useGetReviewQueueQuery,
  useGetAdminAllProjectsQuery,
  useGetMentorProjectsQuery,
  useGetEscrowStatusQuery,
  useSendMessageMutation,
  useGetProjectMessagesQuery,
  useGetProjectParticipantsQuery,
  useMarkMessageReadMutation,
  useGetUnreadCountQuery,
  useGetOpenDisputesQuery,
  useResolveDisputeMutation,
  useGetPublicPortfolioQuery,
  useAssignMentorMutation,
  useGetProjectsWithoutMentorQuery,
  useSearchStudentsQuery,
} = apiSlice;
