package com.government.subsidy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SubsidyTrackingApplication {

	public static void main(String[] args) {
		SpringApplication.run(SubsidyTrackingApplication.class, args);
	}

}
