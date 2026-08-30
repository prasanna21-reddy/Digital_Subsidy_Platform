package com.government.subsidy.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**", "/api/v1/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/schemes/**", "/api/v1/schemes/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/schemes/**", "/api/v1/schemes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/schemes/**", "/api/v1/schemes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/schemes/**", "/api/v1/schemes/**").hasRole("ADMIN")
                        .requestMatchers("/api/beneficiaries/**", "/api/v1/beneficiaries/**").hasAnyRole("CITIZEN", "ADMIN")
                        .requestMatchers("/api/applications/**", "/api/v1/applications/**").hasAnyRole("CITIZEN", "FIELD_OFFICER", "DISTRICT_OFFICER", "FINANCE_OFFICER", "ADMIN")
                        .requestMatchers("/api/workflow/field/**", "/api/v1/workflow/field/**").hasAnyRole("FIELD_OFFICER", "ADMIN")
                        .requestMatchers("/api/workflow/district/**", "/api/v1/workflow/district/**").hasAnyRole("DISTRICT_OFFICER", "ADMIN")
                        .requestMatchers("/api/workflow/finance/**", "/api/v1/workflow/finance/**").hasAnyRole("FINANCE_OFFICER", "ADMIN")
                        .requestMatchers("/api/workflow/**", "/api/v1/workflow/**").hasAnyRole("FIELD_OFFICER", "DISTRICT_OFFICER", "FINANCE_OFFICER", "ADMIN")
                        .requestMatchers("/api/payments/**", "/api/v1/payments/**").hasAnyRole("FINANCE_OFFICER", "ADMIN")
                        .requestMatchers("/api/disbursements/**", "/api/v1/disbursements/**").hasAnyRole("FINANCE_OFFICER", "ADMIN")
                        .requestMatchers("/api/dashboard/**", "/api/v1/dashboard/**").hasAnyRole("ADMIN", "FINANCE_OFFICER", "DISTRICT_OFFICER", "FIELD_OFFICER", "CITIZEN")
                        .requestMatchers("/api/reports/**", "/api/v1/reports/**").hasAnyRole("ADMIN", "FINANCE_OFFICER")
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
